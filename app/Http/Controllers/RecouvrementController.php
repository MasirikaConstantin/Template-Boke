<?php

namespace App\Http\Controllers;

use App\Exports\RecouvrementExport;
use Inertia\Inertia;
use App\Models\Tranche;
use App\Models\Eleve;
use App\Models\Paiement;
use Barryvdh\DomPDF\Facade\Pdf;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

use Illuminate\Support\Str;

class RecouvrementController extends Controller
{
    public function index(Request $request)
    {
        $tranches = Tranche::with(['configuration_frais'])
            ->whereHas('configuration_frais', function ($q) {
                $q->where('est_actif', true);
            })
            ->orderBy('ordre')
            ->get();

        $selectedTrancheId = $request->input('tranche_id');
        $selectedClasseId = $request->input('classe_id');

        $dettes = [];
        $stats = [
            'total_eleves' => 0,
            'total_dette' => 0,
            'total_paye' => 0,
            'taux_recouvrement' => 0,
        ];

        if ($selectedTrancheId) {
            $tranche = Tranche::with('configuration_frais')->find($selectedTrancheId);

            if ($tranche) {
                // Récupérer les élèves avec leurs classes
                $query = Eleve::query()
                    ->with(['classe' => function ($q) {
                        $q->select('id', 'nom_classe');
                    }])
                    ->select('eleves.*')
                    ->addSelect([
                        'montant_paye' => Paiement::selectRaw('COALESCE(SUM(montant), 0)')
                            ->whereColumn('eleve_id', 'eleves.id')
                            ->where('tranche_id', $selectedTrancheId),
                        'date_dernier_paiement' => Paiement::select('date_paiement')
                            ->whereColumn('eleve_id', 'eleves.id')
                            ->where('tranche_id', $selectedTrancheId)
                            ->orderBy('date_paiement', 'desc')
                            ->limit(1),
                    ]);

                // Filtrer par classe si spécifié
                if ($selectedClasseId) {
                    $query->where('classe_id', $selectedClasseId);
                }

                $eleves = $query->get();

                $dettes = $eleves->map(function ($eleve) use ($tranche) {
                    $montant_paye = $eleve->montant_paye ?? 0;
                    $montant_du = $tranche->montant;
                    $reste_a_payer = max(0, $montant_du - $montant_paye);
                    $pourcentage_paye = $montant_du > 0 ? ($montant_paye / $montant_du) * 100 : 0;

                    return [
                        'id' => $eleve->id,
                        'nom' => $eleve->nom,
                        'prenom' => $eleve->prenom,
                        'ref' => $eleve->ref,
                        'classe' => $eleve->classe ? $eleve->classe->nom_classe : '',   // <-- CORRIGÉ
                        'tranche_id' => $tranche->id,
                        'tranche_nom' => $tranche->nom_tranche,
                        'montant_total' => $montant_du,
                        'montant_paye' => $montant_paye,
                        'reste_a_payer' => $reste_a_payer,
                        'pourcentage_paye' => $pourcentage_paye,
                        'est_regle' => $reste_a_payer <= 0,
                        'date_limite' => $tranche->date_limite,
                        'jours_restants' => Carbon::parse($tranche->date_limite)->diffInDays(now(), false) * -1,
                        'date_dernier_paiement' => $eleve->date_dernier_paiement,
                        'statut' => $this->getStatutDette($reste_a_payer, $tranche->date_limite),
                    ];
                });


                // Filtrer selon le statut demandé
                $statut = $request->input('statut', 'tous');
                if ($statut !== 'tous') {
                    $dettes = $dettes->filter(function ($dette) use ($statut) {
                        return $dette['statut']['code'] === $statut;
                    });
                }

                // Calculer les statistiques
                $stats['total_eleves'] = $dettes->count();
                $stats['total_dette'] = $dettes->sum('montant_total');
                $stats['total_paye'] = $dettes->sum('montant_paye');
                $stats['taux_recouvrement'] = $stats['total_dette'] > 0
                    ? ($stats['total_paye'] / $stats['total_dette']) * 100
                    : 0;
                $stats['total_reste'] = $dettes->sum('reste_a_payer');
                $stats['nombre_regles'] = $dettes->where('est_regle', true)->count();
                $stats['nombre_en_retard'] = $dettes->where('statut.code', 'retard')->count();
            }
        }

        // Récupérer les classes pour le filtre
        $classes = DB::table('classes')
            ->where('statut', 'active')
            ->orderBy('nom_classe')
            ->get(['id', 'nom_classe']);

        return Inertia::render('Recouvrement/Index', [
            'tranches' => $tranches,
            'classes' => $classes,
            'dettes' => $dettes,
            'stats' => $stats,
            'filters' => $request->only(['tranche_id', 'classe_id', 'statut']),
            'selectedTranche' => $selectedTrancheId ? Tranche::with('configuration_frais')->find($selectedTrancheId) : null,
        ]);
    }

    private function getStatutDette($reste_a_payer, $date_limite)
    {
        $aujourdhui = now();
        $dateLimite = Carbon::parse($date_limite);

        if ($reste_a_payer <= 0) {
            return [
                'code' => 'regle',
                'label' => 'Réglé',
                'color' => 'success',
                'variant' => 'default',
            ];
        }

        if ($dateLimite->isPast()) {
            return [
                'code' => 'retard',
                'label' => 'En retard',
                'color' => 'destructive',
                'variant' => 'destructive',
            ];
        }

        $joursRestants = $dateLimite->diffInDays($aujourdhui);

        if ($joursRestants <= 7) {
            return [
                'code' => 'urgent',
                'label' => 'Urgent',
                'color' => 'warning',
                'variant' => 'warning',
            ];
        }

        return [
            'code' => 'en_cours',
            'label' => 'En cours',
            'color' => 'info',
            'variant' => 'secondary',
        ];
    }

    public function genererRapport(Request $request)
    {
        $request->validate([
            'tranche_id' => 'required|exists:tranches,id',
            'format' => 'required|in:pdf,excel',
            'filters' => 'array',
            'selection' => 'array|nullable', // IDs spécifiques d'élèves
        ]);

        $tranche = Tranche::with('configuration_frais')->find($request->tranche_id);

        if (!$tranche) {
            return back()->withErrors(['error' => 'Tranche non trouvée.']);
        }

        // Récupérer les dettes avec les mêmes filtres que l'index
        $query = Eleve::query()
            ->with(['classe', 'paiements' => function ($q) use ($tranche) {
                $q->where('tranche_id', $tranche->id);
            }])
            ->select('eleves.*')
            ->addSelect([
                'montant_paye' => Paiement::selectRaw('COALESCE(SUM(montant), 0)')
                    ->whereColumn('eleve_id', 'eleves.id')
                    ->where('tranche_id', $tranche->id),
                'date_dernier_paiement' => Paiement::select('date_paiement')
                    ->whereColumn('eleve_id', 'eleves.id')
                    ->where('tranche_id', $tranche->id)
                    ->orderBy('date_paiement', 'desc')
                    ->limit(1),
            ]);

        // Filtrer par classe si spécifié
        if ($request->filled('filters.classe_id') && $request->filters['classe_id'] !== 'all') {
            $query->where('classe_id', $request->filters['classe_id']);
        }

        // Filtrer par sélection spécifique
        if ($request->filled('selection') && is_array($request->selection) && count($request->selection) > 0) {
            $query->whereIn('eleves.id', $request->selection);
        }

        $eleves = $query->get();

        if ($eleves->isEmpty()) {
            return back()->withErrors(['error' => 'Aucun élève trouvé pour cette tranche avec les filtres sélectionnés.']);
        }

        $dettes = $eleves->map(function ($eleve) use ($tranche) {
    $montant_paye = $eleve->montant_paye ?? 0;
    $montant_du = $tranche->montant;
    $reste_a_payer = max(0, $montant_du - $montant_paye);
    $pourcentage_paye = $montant_du > 0 ? ($montant_paye / $montant_du) * 100 : 0;

    $statut = $this->getStatutDette($reste_a_payer, $tranche->date_limite);

    return [
        'id' => $eleve->id,
        'nom_complet' => $eleve->nom . ' ' . $eleve->prenom,
        'nom' => $eleve->nom,
        'prenom' => $eleve->prenom,
        'ref' => $eleve->ref,
        'classe' => $eleve->classe ? $eleve->classe->nom_classe : 'Non assigné',
        'montant_total' => $montant_du,
        'montant_paye' => $montant_paye,
        'reste_a_payer' => $reste_a_payer,
        'pourcentage_paye' => $pourcentage_paye,
        'est_regle' => $reste_a_payer <= 0,
        'date_dernier_paiement' => $eleve->date_dernier_paiement,
        'jours_restants' => Carbon::parse($tranche->date_limite)->diffInDays(now(), false) * -1,

        // Ajouts nécessaires :
        'statut_code' => $statut['code'],     // EX: "regle", "urgent", "retard"
        'statut_label' => $statut['label'],   // EX: "Réglé", "En retard", etc.
    ];
});


        // Filtrer par statut si spécifié
        if ($request->filled('filters.statut') && $request->filters['statut'] !== 'tous') {
            $dettes = $dettes->filter(function ($dette) use ($request, $tranche) {
                $statut = $this->getStatutDette(
                    $dette['reste_a_payer'],
                    $tranche->date_limite
                );
                return $statut['code'] === $request->filters['statut'];
            });
        }

        if ($dettes->isEmpty()) {
            return back()->withErrors(['error' => 'Aucune dette correspondant aux filtres sélectionnés.']);
        }

        $stats = [
            'total_eleves' => $dettes->count(),
            'total_dette' => $dettes->sum('montant_total'),
            'total_paye' => $dettes->sum('montant_paye'),
            'total_reste' => $dettes->sum('reste_a_payer'),
            'taux_recouvrement' => $dettes->sum('montant_total') > 0
                ? ($dettes->sum('montant_paye') / $dettes->sum('montant_total')) * 100
                : 0,
        ];

        $filename = 'recouvrement-' . Str::slug($tranche->nom_tranche) . '-' . now()->format('Y-m-d-H-i');

        if ($request->format === 'excel') {
            return Excel::download(new RecouvrementExport($dettes, $tranche, $stats), $filename . '.xlsx');
        }

        return $this->genererPDF($dettes, $tranche, $stats, $filename);
    }

    private function genererPDF($dettes, $tranche, $stats, $filename)
    {
        $dateGeneration = now()->format('d/m/Y H:i');
        $dateLimite = Carbon::parse($tranche->date_limite)->format('d/m/Y');

        $html = view('exports.recouvrement-pdf', compact('dettes', 'tranche', 'stats', 'dateGeneration', 'dateLimite'))->render();

        $pdf = PDF::loadHTML($html)
            ->setPaper('A4', 'landscape')
            ->setOptions([
                'defaultFont' => 'dejavu sans',
                'isHtml5ParserEnabled' => true,
                'isRemoteEnabled' => true,
            ]);

        return $pdf->download($filename . '.pdf');
    }

    public function envoyerRappels(Request $request)
    {
        $request->validate([
            'tranche_id' => 'required|exists:tranches,id',
            'eleve_ids' => 'required|array',
            'message' => 'nullable|string',
        ]);

        $tranche = Tranche::with('configuration_frais')->find($request->tranche_id);
        $eleves = Eleve::whereIn('id', $request->eleve_ids)->get();

        foreach ($eleves as $eleve) {
            // Logique d'envoi de notification (email, SMS, etc.)
            // Vous pouvez utiliser Laravel Notifications ou un service tiers
            $this->envoyerRappel($eleve, $tranche, $request->message);
        }

        return back()->with('success', 'Rappels envoyés avec succès à ' . count($eleves) . ' élève(s).');
    }

    private function envoyerRappel($eleve, $tranche, $messagePersonnalise = null)
    {
        // Logique d'envoi de rappel
        // Exemple avec Laravel Mail:
        /*
        Mail::to($eleve->email_parent)->send(new RappelPaiement(
            $eleve, 
            $tranche,
            $messagePersonnalise
        ));
        */
    }
}
