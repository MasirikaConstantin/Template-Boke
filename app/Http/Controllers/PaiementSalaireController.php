<?php

namespace App\Http\Controllers;

use App\Models\PaiementSalaire;
use App\Models\ProfSalaire;
use App\Models\Professeur;
use App\Models\Presence;
use App\Models\AvanceSalaire;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class PaiementSalaireController extends Controller
{
    public function index(Request $request)
    {
        $query = PaiementSalaire::with(['professeur', 'profSalaire', 'avance'])
            ->active()
            ->when($request->search, function ($q, $search) {
                $q->whereHas('professeur', function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('ref', 'like', "%{$search}%");
            })
            ->when($request->professeur_id && $request->professeur_id !== 'all', function ($q, $professeurId) {
                $q->where('professeur_id', $professeurId);
            })
            ->when($request->type_paiement && $request->type_paiement !== 'all', function ($q, $type) {
                $q->where('type_paiement', $type);
            })
            ->when($request->statut && $request->statut !== 'all', function ($q, $statut) {
                $q->where('statut', $statut);
            })
            ->when($request->periode && $request->periode !== 'all', function ($q, $periode) {
                $q->where('periode', $periode);
            });

        $sortBy = $request->input('sort_by', 'date_paiement');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        $query->orderBy($sortBy, $sortDirection);

        $paiements = $query->paginate($request->input('per_page', 10));

        // Générer les périodes disponibles
        $periodes = PaiementSalaire::select('periode')
            ->distinct()
            ->orderBy('periode', 'desc')
            ->get()
            ->map(function ($item) {
                $date = Carbon::createFromFormat('Y-m', $item->periode);
                return [
                    'value' => $item->periode,
                    'label' => $date->format('F Y'),
                ];
            });

        $stats = [
            'total' => PaiementSalaire::active()->count(),
            'paye' => PaiementSalaire::paye()->count(),
            'en_attente' => PaiementSalaire::enAttente()->count(),
            'total_montant' => PaiementSalaire::active()->sum('montant'),
            'total_net_a_payer' => PaiementSalaire::active()->sum('montant'),
        ];

        $professeurs = Professeur::active()->get(['id', 'nom', 'email']);

        return Inertia::render('PaiementSalaires/Index', [
            'paiements' => $paiements,
            'filters' => $request->only(['search', 'professeur_id', 'type_paiement', 'statut', 'periode', 'per_page', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'professeurs' => $professeurs,
            'periodes' => $periodes,
            'flash' => session('flash', [])
        ]);
    }

    public function create()
    {
        $professeurs = Professeur::active()->with('salaires')->get();
        $today = now()->format('Y-m-d');
        $periodeCourante = now()->format('Y-m');
        
        return Inertia::render('PaiementSalaires/Create', [
            'professeurs' => $professeurs,
            'today' => $today,
            'periode_courante' => $periodeCourante,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'type_paiement' => 'required|in:normal,avance,regularisation',
            'montant' => 'required_if:type_paiement,avance,regularisation|nullable|numeric|min:0',
            'date_paiement' => 'required|date',
            'periode' => 'required_if:type_paiement,normal|nullable|date_format:Y-m',
            'statut' => 'sometimes|in:en_attente,paye',
            'avance_id' => 'nullable|exists:avance_salaires,id',
            'retenues' => 'nullable|numeric|min:0',
        ]);

        // Récupérer la configuration de salaire
        $profSalaire = ProfSalaire::where('professeur_id', $validated['professeur_id'])
            ->active()
            ->first();

        if (!$profSalaire) {
            return redirect()->back()->withErrors([
                'professeur_id' => 'Ce professeur n\'a pas de configuration de salaire.'
            ]);
        }

        $paiementData = [
            'professeur_id' => $validated['professeur_id'],
            'prof_salaire_id' => $profSalaire->id,
            'type_paiement' => $validated['type_paiement'],
            'date_paiement' => $validated['date_paiement'],
            'statut' => $validated['statut'] ?? 'paye',
            'retenues' => $validated['retenues'] ?? 0,
        ];

        if ($validated['type_paiement'] === 'normal') {
            // Calcul automatique pour le salaire normal
            $paiementData['periode'] = $validated['periode'];
            $paiementData['salaire_base'] = $this->calculerSalaireBase($profSalaire, $validated['periode'], $validated['heures_travaillees'] ?? null);
            $paiementData['avances_deduites'] = $this->calculerAvancesADeduire($validated['professeur_id'], $validated['periode']);
        } else {
            // Pour les avances et régularisations
            $paiementData['montant'] = $validated['montant'];
            $paiementData['salaire_base'] = $validated['montant'];
            $paiementData['avances_deduites'] = 0;
            
            if ($validated['type_paiement'] === 'avance' && isset($validated['avance_id'])) {
                $paiementData['avance_id'] = $validated['avance_id'];
            }
        }

        $paiement = PaiementSalaire::create($paiementData);

        return redirect()->route('paiement-salaires.index')
            ->with('flash', [
                'success' => 'Paiement enregistré avec succès.'
            ]);
    }

    public function show(PaiementSalaire $paiementSalaire)
    {
        $paiementSalaire->load(['professeur', 'profSalaire', 'avance']);

        return Inertia::render('PaiementSalaires/Show', [
            'paiement' => $paiementSalaire,
        ]);
    }

    public function edit(PaiementSalaire $paiementSalaire)
    {
        $professeurs = Professeur::with('profSalaire')->active()->get();
        $avances = AvanceSalaire::where('professeur_id', $paiementSalaire->professeur_id)
            ->whereIn('statut', ['payee'])
            ->get();

        return Inertia::render('PaiementSalaires/Edit', [
            'paiement' => $paiementSalaire,
            'professeurs' => $professeurs,
            'avances' => $avances,
        ]);
    }

    public function update(Request $request, PaiementSalaire $paiementSalaire)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'type_paiement' => 'required|in:normal,avance,regularisation',
            'montant' => 'required_if:type_paiement,avance,regularisation|nullable|numeric|min:0',
            'date_paiement' => 'required|date',
            'periode' => 'required_if:type_paiement,normal|nullable|date_format:Y-m',
            'statut' => 'sometimes|in:en_attente,paye',
            'avance_id' => 'nullable|exists:avance_salaires,id',
            'heures_travaillees' => 'nullable|numeric|min:0',
            'retenues' => 'nullable|numeric|min:0',
        ]);

        $paiementSalaire->update($validated);

        return redirect()->route('paiement-salaires.index')
            ->with('flash', [
                'success' => 'Paiement mis à jour avec succès.'
            ]);
    }

    public function destroy(PaiementSalaire $paiementSalaire)
    {
        $paiementSalaire->delete();

        return redirect()->route('paiement-salaires.index')
            ->with('flash', [
                'success' => 'Paiement supprimé avec succès.'
            ]);
    }

    public function calculerPaiementAutomatique(Request $request)
    {
        $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'periode' => 'required|date_format:Y-m',
        ]);

        $profSalaire = ProfSalaire::where('professeur_id', $request->professeur_id)
            ->active()
            ->first();

        if (!$profSalaire) {
            return response()->json([
                'error' => 'Configuration de salaire non trouvée.'
            ], 404);
        }

        $salaireBase = $this->calculerSalaireBase($profSalaire, $request->periode);
        $avancesADeduire = $this->calculerAvancesADeduire($request->professeur_id, $request->periode);
        $heuresTravaillees = $this->calculerHeuresTravaillees($request->professeur_id, $request->periode);

        return response()->json([
            'salaire_base' => $salaireBase,
            'avances_deduites' => $avancesADeduire,
            'heures_travaillees' => $heuresTravaillees,
            'net_a_payer' => max(0, $salaireBase - $avancesADeduire),
            'periode_label' => Carbon::createFromFormat('Y-m', $request->periode)->format('F Y'),
        ]);
    }

    private function calculerSalaireBase($profSalaire, $periode, $heuresTravaillees = null)
    {
        if ($profSalaire->type_salaire === 'horaire') {
            $heures = $heuresTravaillees ?? $this->calculerHeuresTravaillees($profSalaire->professeur_id, $periode);
            return $heures * $profSalaire->taux_horaire;
        } else {
            return $profSalaire->salaire_fixe;
        }
    }

    private function calculerHeuresTravaillees($professeurId, $periode)
    {
        $date = Carbon::createFromFormat('Y-m', $periode);
        $startDate = $date->copy()->startOfMonth();
        $endDate = $date->copy()->endOfMonth();

        $presences = Presence::where('professeur_id', $professeurId)
            ->whereBetween('date', [$startDate, $endDate])
            ->whereNotNull('heure_arrivee')
            ->get();

        return $presences->sum('heures_prestées');
    }

    private function calculerAvancesADeduire($professeurId, $periode)
    {
        $date = Carbon::createFromFormat('Y-m', $periode);
        $startDate = $date->copy()->startOfMonth();
        $endDate = $date->copy()->endOfMonth();

        $avances = AvanceSalaire::where('professeur_id', $professeurId)
            ->whereIn('statut', ['payee'])
            ->whereBetween('date_avance', [$startDate, $endDate])
            ->sum('montant');

        return $avances;
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:paiement_salaires,id',
            'action' => 'required|in:delete,mark_paye,mark_en_attente',
        ]);

        $ids = $request->input('ids');

        switch ($request->input('action')) {
            case 'delete':
                PaiementSalaire::whereIn('id', $ids)->delete();
                $message = 'Paiements supprimés avec succès.';
                break;

            case 'mark_paye':
                PaiementSalaire::whereIn('id', $ids)->update(['statut' => 'paye']);
                $message = 'Paiements marqués comme payés.';
                break;

            case 'mark_en_attente':
                PaiementSalaire::whereIn('id', $ids)->update(['statut' => 'en_attente']);
                $message = 'Paiements marqués comme en attente.';
                break;
        }

        return redirect()->back()->with('flash', ['success' => $message]);
    }

    public function genererBulletin(PaiementSalaire $paiementSalaire)
    {
        $paiementSalaire->load(['professeur', 'profSalaire', 'avance']);
        
        $periode = Carbon::createFromFormat('Y-m', $paiementSalaire->periode);
        
        $data = [
            'paiement' => $paiementSalaire,
            'periode' => $periode->format('F Y'),
            'entreprise' => [
                'nom' => config('app.name'),
                'adresse' => 'Adresse de l\'entreprise',
                'siret' => 'SIRET de l\'entreprise',
            ],
            'date_edition' => now()->format('d/m/Y'),
        ];

        // Générer un PDF ou retourner une vue
        return Inertia::render('PaiementSalaires/Bulletin', $data);
    }
}