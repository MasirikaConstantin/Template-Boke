<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Paiement;
use App\Models\Eleve;
use App\Models\Tranche;
use App\Models\HistoriquePaiement;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class PaiementController extends Controller
{
    public function index(Request $request)
    {
        $query = Paiement::query()
            ->with(['eleve', 'tranche', 'user'])
            ->orderBy($request->input('sort_by', 'date_paiement'), $request->input('sort_direction', 'desc'));

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference', 'like', "%{$search}%")
                  ->orWhereHas('eleve', function ($q) use ($search) {
                      $q->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('eleve_id')) {
            $query->where('eleve_id', $request->eleve_id);
        }

        if ($request->filled('tranche_id')) {
            $query->where('tranche_id', $request->tranche_id);
        }

        if ($request->filled('mode_paiement') && $request->mode_paiement !== 'all') {
            $query->where('mode_paiement', $request->mode_paiement);
        }

        if ($request->filled('date_debut')) {
            $query->where('date_paiement', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->where('date_paiement', '<=', $request->date_fin);
        }

        $paiements = $query->paginate($request->input('per_page', 15))
            ->withQueryString();

        $stats = $this->getStats($request);

        $eleves = Eleve::orderBy('nom')->orderBy('prenom')->get(['id', 'nom', 'prenom', 'ref']);
        $tranches = Tranche::with('configuration_frais')
            ->orderBy('ordre')
            ->get(['id', 'nom_tranche', 'configuration_frai_id']);

        return Inertia::render('Paiements/Index', [
            'paiements' => $paiements,
            'filters' => $request->only(['search', 'eleve_id', 'tranche_id', 'mode_paiement', 'date_debut', 'date_fin', 'per_page', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'eleves' => $eleves,
            'tranches' => $tranches,
        ]);
    }

    private function getStats(Request $request)
    {
        $query = Paiement::query();

        if ($request->filled('date_debut')) {
            $query->where('date_paiement', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->where('date_paiement', '<=', $request->date_fin);
        }

        $total = $query->count();
        $montant_total = $query->sum('montant');

        $par_mode = $query->clone()
            ->select('mode_paiement', DB::raw('COUNT(*) as count'), DB::raw('SUM(montant) as total'))
            ->groupBy('mode_paiement')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->mode_paiement => [
                    'count' => $item->count,
                    'total' => $item->total
                ]];
            });

        $recent = Paiement::orderBy('date_paiement', 'desc')
            ->limit(5)
            ->get();

        return [
            'total' => $total,
            'montant_total' => $montant_total,
            'par_mode' => $par_mode,
            'recent' => $recent,
            'aujourdhui' => [
                'count' => Paiement::whereDate('date_paiement', today())->count(),
                'total' => Paiement::whereDate('date_paiement', today())->sum('montant')
            ],
            'ce_mois' => [
                'count' => Paiement::whereMonth('date_paiement', now()->month)
                    ->whereYear('date_paiement', now()->year)
                    ->count(),
                'total' => Paiement::whereMonth('date_paiement', now()->month)
                    ->whereYear('date_paiement', now()->year)
                    ->sum('montant')
            ]
        ];
    }

    public function create()
    {
        $eleves = Eleve::orderBy('nom')->orderBy('prenom')->get();
        $tranches = Tranche::with('configuration_frais')
            ->whereHas('configuration_frais', function ($q) {
                $q->where('est_actif', true);
            })
            ->orderBy('ordre')
            ->get();

        return Inertia::render('Paiements/Form', [
            'eleves' => $eleves,
            'tranches' => $tranches,
            'reference' => 'PAY-' . strtoupper(Str::random(10)),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'eleve_id' => 'nullable|exists:eleves,id',
            'tranche_id' => 'nullable|exists:tranches,id',
            'reference' => 'required|string|max:255|unique:paiements,reference',
            'montant' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:espèce,chèque,virement,mobile_money',
            'numero_cheque' => 'nullable|string|max:255|required_if:mode_paiement,chèque',
            'commentaire' => 'nullable|string',
            'date_paiement' => 'required|date',
        ]);
        //dd($validated);

        DB::beginTransaction();

        try {
            $paiement = Paiement::create(array_merge($validated, [
                'user_id' => Auth::user()->id,
            ]));

            // Enregistrer l'historique
            HistoriquePaiement::create([
                'paiement_id' => $paiement->id,
                'action' => 'création',
                'details' => json_encode([
                    'montant' => $paiement->montant,
                    'mode_paiement' => $paiement->mode_paiement,
                    'par' => Auth::user()->name
                ]),
                'user_id' => Auth::user()->id,
            ]);

            DB::commit();

            return redirect()->route('paiements.index')
                ->with('success', 'Paiement enregistré avec succès.');

        } catch (\Exception $e) {
            dd($e->getMessage());
            DB::rollBack();
            return back()->withErrors(['error' => 'Une erreur est survenue lors de l\'enregistrement.']);
        }
    }

    public function show(Paiement $paiement)
    {
        $paiement->load(['eleve', 'tranche', 'user', 'historique_paiements.user']);

        return Inertia::render('Paiements/Show', [
            'paiement' => $paiement,
        ]);
    }

    public function edit(Paiement $paiement)
    {
        $paiement->load(['eleve', 'tranche']);
        
        $eleves = Eleve::orderBy('nom')->orderBy('prenom')->get();
        $tranches = Tranche::with('configuration_frais')
            ->whereHas('configuration_frais', function ($q) {
                $q->where('est_actif', true);
            })
            ->orderBy('ordre')
            ->get();

        return Inertia::render('Paiements/Form', [
            'paiement' => $paiement,
            'eleves' => $eleves,
            'tranches' => $tranches,
        ]);
    }

    public function update(Request $request, Paiement $paiement)
    {
        $validated = $request->validate([
            'eleve_id' => 'nullable|exists:eleves,id',
            'tranche_id' => 'nullable|exists:tranches,id',
            'reference' => 'required|string|max:255|unique:paiements,reference,' . $paiement->id,
            'montant' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:espèce,chèque,virement,mobile_money',
            'numero_cheque' => 'nullable|string|max:255|required_if:mode_paiement,chèque',
            'commentaire' => 'nullable|string',
            'date_paiement' => 'required|date',
        ]);

        DB::beginTransaction();

        try {
            $ancien = $paiement->toArray();
            
            $paiement->update($validated);

            // Enregistrer l'historique
            HistoriquePaiement::create([
                'paiement_id' => $paiement->id,
                'action' => 'modification',
                'details' => json_encode([
                    'ancien' => $ancien,
                    'nouveau' => $validated,
                    'par' => auth()->user()->name
                ]),
                'user_id' => auth()->id(),
            ]);

            DB::commit();

            return redirect()->route('paiements.index')
                ->with('success', 'Paiement modifié avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la modification.']);
        }
    }

    public function destroy(Paiement $paiement)
    {
        DB::beginTransaction();

        try {
            // Enregistrer l'historique avant suppression
            HistoriquePaiement::create([
                'paiement_id' => $paiement->id,
                'action' => 'annulation',
                'details' => json_encode([
                    'paiement' => $paiement->toArray(),
                    'par' => auth()->user()->name
                ]),
                'user_id' => auth()->id(),
            ]);

            $paiement->delete();

            DB::commit();

            return redirect()->route('paiements.index')
                ->with('success', 'Paiement annulé avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Une erreur est survenue lors de l\'annulation.']);
        }
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:delete,export',
        ]);

        $ids = $request->input('ids');

        if ($request->input('action') === 'delete') {
            Paiement::whereIn('id', $ids)->delete();
            return redirect()->back()->with('success', 'Paiements supprimés avec succès.');
        }

        // Export logic here
        return redirect()->back()->with('success', 'Export initié.');
    }

    public function rapport(Request $request)
    {
        $query = Paiement::query()
            ->with(['eleve', 'tranche.configuration_frais'])
            ->orderBy('date_paiement', 'desc');

        if ($request->filled('date_debut')) {
            $query->where('date_paiement', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->where('date_paiement', '<=', $request->date_fin);
        }

        $paiements = $query->get();

        $stats = [
            'total' => $paiements->count(),
            'montant_total' => $paiements->sum('montant'),
            'par_mode' => $paiements->groupBy('mode_paiement')->map(function ($group) {
                return [
                    'count' => $group->count(),
                    'total' => $group->sum('montant')
                ];
            }),
            'par_jour' => $paiements->groupBy('date_paiement')->map(function ($group, $date) {
                return [
                    'date' => $date,
                    'count' => $group->count(),
                    'total' => $group->sum('montant')
                ];
            })->values()
        ];

        return Inertia::render('Paiements/Rapport', [
            'paiements' => $paiements,
            'filters' => $request->only(['date_debut', 'date_fin']),
            'stats' => $stats,
        ]);
    }
}