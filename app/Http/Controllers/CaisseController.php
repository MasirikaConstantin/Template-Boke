<?php

namespace App\Http\Controllers;

use App\Models\Depense;
use App\Models\Paiement;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\CaisseExport;

class CaisseController extends Controller
{
    public function index(Request $request)
    {
        // Dates par défaut (aujourd'hui)
        $dateDebut = $request->input('date_debut', Carbon::today()->toDateString());
        $dateFin = $request->input('date_fin', Carbon::today()->toDateString());

        // Récupérer les paiements (entrées)
        $paiements = Paiement::query()
            ->whereBetween('date_paiement', [$dateDebut, $dateFin])
            ->with(['eleve', 'tranche', 'user'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'like', "%{$search}%")
                        ->orWhere('commentaire', 'like', "%{$search}%")
                        ->orWhereHas('eleve', function ($qe) use ($search) {
                            $qe->where('nom', 'like', "%{$search}%")
                                ->orWhere('prenom', 'like', "%{$search}%")
                                ->orWhere('matricule', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->filled('mode_paiement') && $request->mode_paiement !== 'all', function ($query) use ($request) {
                $query->where('mode_paiement', $request->mode_paiement);
            });

        // Récupérer les dépenses (sorties)
        $depenses = Depense::query()
            ->whereBetween('date_depense', [$dateDebut, $dateFin])
            ->where('statut', 'paye') // Seulement les dépenses payées
            ->with(['budget', 'categorie', 'user'])
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'like', "%{$search}%")
                        ->orWhere('libelle', 'like', "%{$search}%")
                        ->orWhere('beneficiaire', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('mode_paiement') && $request->mode_paiement !== 'all', function ($query) use ($request) {
                $query->where('mode_paiement', $request->mode_paiement);
            });

        // Combiner les résultats
        $mouvementsPaiements = $paiements->get()->map(function ($paiement) {
            return [
                'id' => $paiement->id,
                'type' => 'entree',
                'reference' => $paiement->reference,
                'libelle' => 'Paiement frais scolaire',
                'montant' => $paiement->montant,
                'mode_paiement' => $paiement->mode_paiement,
                'date' => $paiement->date_paiement,
                'created_at' => $paiement->created_at,
                'eleve' => $paiement->eleve ? [
                    'nom_complet' => $paiement->eleve->nom_complet,
                    'matricule' => $paiement->eleve->matricule,
                ] : null,
                'user' => [
                    'name' => $paiement->user->name,
                ],
                'details' => [
                    'tranche' => $paiement->tranche?->nom_tranche,
                ],
            ];
        });

        $mouvementsDepenses = $depenses->get()->map(function ($depense) {
            return [
                'id' => $depense->id,
                'type' => 'sortie',
                'reference' => $depense->reference,
                'libelle' => $depense->libelle,
                'montant' => $depense->montant,
                'mode_paiement' => $depense->mode_paiement,
                'date' => $depense->date_depense,
                'created_at' => $depense->created_at,
                'statut' => $depense->statut,
                'budget' => $depense->budget ? [
                    'nom_complet' => $depense->budget->nom_complet,
                ] : null,
                'user' => [
                    'name' => $depense->user->name,
                ],
                'details' => [
                    'beneficiaire' => $depense->beneficiaire,
                    'categorie' => $depense->categorie?->nom_categorie,
                ],
            ];
        });

        // Fusionner et trier par date
        $mouvements = $mouvementsPaiements->merge($mouvementsDepenses)
            ->sortByDesc('date')
            ->values();

        // Pagination manuelle
        $perPage = $request->input('per_page', 15);
        $currentPage = $request->input('page', 1);
        $offset = ($currentPage - 1) * $perPage;
        $paginatedMouvements = $mouvements->slice($offset, $perPage)->values();

        // Calculer les statistiques
        $totalEntrees = $paiements->sum('montant');
        $totalSorties = $depenses->sum('montant');

        // Pour cet exemple, on prend le solde de la veille comme solde initial
        $soldeInitial = 0; // À remplacer par votre logique de solde initial
        $soldeFinal = $soldeInitial + $totalEntrees - $totalSorties;

        // Statistiques supplémentaires
        $jourMaxEntrees = Paiement::select(DB::raw('DATE(date_paiement) as jour'))
            ->selectRaw('SUM(montant) as total')
            ->whereBetween('date_paiement', [$dateDebut, $dateFin])
            ->groupBy('jour')
            ->orderByDesc('total')
            ->first();

        $jourMaxSorties = Depense::select(DB::raw('DATE(date_depense) as jour'))
            ->selectRaw('SUM(montant) as total')
            ->whereBetween('date_depense', [$dateDebut, $dateFin])
            ->where('statut', 'paye')
            ->groupBy('jour')
            ->orderByDesc('total')
            ->first();

        // Périodes prédéfinies
        $periodes = [
            [
                'label' => 'Aujourd\'hui',
                'date_debut' => Carbon::today()->toDateString(),
                'date_fin' => Carbon::today()->toDateString(),
            ],
            [
                'label' => 'Hier',
                'date_debut' => Carbon::yesterday()->toDateString(),
                'date_fin' => Carbon::yesterday()->toDateString(),
            ],
            [
                'label' => 'Cette semaine',
                'date_debut' => Carbon::now()->startOfWeek()->toDateString(),
                'date_fin' => Carbon::now()->endOfWeek()->toDateString(),
            ],
            [
                'label' => 'Ce mois',
                'date_debut' => Carbon::now()->startOfMonth()->toDateString(),
                'date_fin' => Carbon::now()->endOfMonth()->toDateString(),
            ],
            [
                'label' => 'Mois dernier',
                'date_debut' => Carbon::now()->subMonth()->startOfMonth()->toDateString(),
                'date_fin' => Carbon::now()->subMonth()->endOfMonth()->toDateString(),
            ],
        ];

        return Inertia::render('Caisse/Index', [
            'mouvements' => [
                'data' => $paginatedMouvements,
                'current_page' => $currentPage,
                'last_page' => ceil($mouvements->count() / $perPage),
                'total' => $mouvements->count(),
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $mouvements->count()),
            ],
            'stats' => [
                'solde_debut' => $soldeInitial,
                'total_entrees' => $totalEntrees,
                'total_sorties' => $totalSorties,
                'solde_fin' => $soldeFinal,
                'nombre_operations' => $mouvements->count(),
                'jour_max_entrees' => $jourMaxEntrees?->jour ?? 'N/A',
                'jour_max_sorties' => $jourMaxSorties?->jour ?? 'N/A',
            ],
            'filters' => $request->only(['search', 'date_debut', 'date_fin', 'type', 'mode_paiement', 'per_page']),
            'periodes' => $periodes,
            'flash' => session()->get('flash', []),
        ]);
    }

     public function export(Request $request)
    {
        $dateDebut = $request->input('date_debut', Carbon::today()->toDateString());
        $dateFin = $request->input('date_fin', Carbon::today()->toDateString());
        $search = $request->input('search', '');
        $type = $request->input('type', 'all');
        $modePaiement = $request->input('mode_paiement', 'all');

        // Récupérer les données
        $data = $this->getMouvementsData($dateDebut, $dateFin, $search, $type, $modePaiement);
        $stats = $this->calculateStats($data['paiements'], $data['depenses']);

        $format = $request->input('format', 'pdf');

        if ($format === 'excel') {
            return $this->exportExcel($data['mouvements'], $stats, $dateDebut, $dateFin, $search);
        }

        return $this->exportPDF($data['mouvements'], $stats, $dateDebut, $dateFin, $search);
    }

    private function getMouvementsData($dateDebut, $dateFin, $search = '', $type = 'all', $modePaiement = 'all')
    {
        // Paiements (entrées)
        $paiementsQuery = Paiement::query()
            ->whereBetween('date_paiement', [$dateDebut, $dateFin])
            ->with(['eleve', 'tranche', 'user'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'like', "%{$search}%")
                      ->orWhere('commentaire', 'like', "%{$search}%")
                      ->orWhereHas('eleve', function ($qe) use ($search) {
                          $qe->where('nom', 'like', "%{$search}%")
                             ->orWhere('prenom', 'like', "%{$search}%")
                             ->orWhere('matricule', 'like', "%{$search}%");
                      });
                });
            })
            ->when($modePaiement !== 'all', function ($query) use ($modePaiement) {
                $query->where('mode_paiement', $modePaiement);
            });

        // Dépenses (sorties)
        $depensesQuery = Depense::query()
            ->whereBetween('date_depense', [$dateDebut, $dateFin])
            ->where('statut', 'paye')
            ->with(['budget', 'categorie', 'user'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('reference', 'like', "%{$search}%")
                      ->orWhere('libelle', 'like', "%{$search}%")
                      ->orWhere('beneficiaire', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($modePaiement !== 'all', function ($query) use ($modePaiement) {
                $query->where('mode_paiement', $modePaiement);
            });

        // Filtrer par type si spécifié
        if ($type === 'entree') {
            $depensesQuery->whereRaw('1=0'); // Exclure les dépenses
        } elseif ($type === 'sortie') {
            $paiementsQuery->whereRaw('1=0'); // Exclure les paiements
        }

        $paiements = $paiementsQuery->get();
        $depenses = $depensesQuery->get();

        // Transformer les données
        $mouvements = collect();

        foreach ($paiements as $paiement) {
            $mouvements->push([
                'date' => $paiement->date_paiement,
                'heure' => $paiement->created_at->format('H:i'),
                'type' => 'Entrée',
                'reference' => $paiement->reference,
                'description' => 'Paiement frais scolaire',
                'eleve' => $paiement->eleve ? $paiement->eleve->nom_complet : 'N/A',
                'tranche' => $paiement->tranche?->nom_tranche,
                'mode_paiement' => $paiement->mode_paiement,
                'montant' => $paiement->montant,
                'utilisateur' => $paiement->user->name,
                'commentaire' => $paiement->commentaire,
            ]);
        }

        foreach ($depenses as $depense) {
            $mouvements->push([
                'date' => $depense->date_depense,
                'heure' => $depense->created_at->format('H:i'),
                'type' => 'Sortie',
                'reference' => $depense->reference,
                'description' => $depense->libelle,
                'beneficiaire' => $depense->beneficiaire,
                'categorie' => $depense->categorie?->nom_categorie,
                'budget' => $depense->budget?->nom_complet,
                'mode_paiement' => $depense->mode_paiement,
                'montant' => $depense->montant,
                'utilisateur' => $depense->user->name,
                'commentaire' => $depense->description,
                'numero_piece' => $depense->numero_piece,
            ]);
        }

        // Trier par date décroissante
        $mouvements = $mouvements->sortByDesc('date')->values();

        return [
            'mouvements' => $mouvements,
            'paiements' => $paiements,
            'depenses' => $depenses,
        ];
    }

    private function calculateStats($paiements, $depenses)
    {
        $totalEntrees = $paiements->sum('montant');
        $totalSorties = $depenses->sum('montant');
        $soldeInitial = $this->getSoldeInitial($paiements->min('date_paiement'));
        $soldeFinal = $soldeInitial + $totalEntrees - $totalSorties;

        // Statistiques par mode de paiement
        $modesPaiement = [
            'entrees' => $paiements->groupBy('mode_paiement')->map->sum('montant'),
            'sorties' => $depenses->groupBy('mode_paiement')->map->sum('montant'),
        ];

        return [
            'total_entrees' => $totalEntrees,
            'total_sorties' => $totalSorties,
            'solde_initial' => $soldeInitial,
            'solde_final' => $soldeFinal,
            'nombre_entrees' => $paiements->count(),
            'nombre_sorties' => $depenses->count(),
            'total_operations' => $paiements->count() + $depenses->count(),
            'modes_paiement' => $modesPaiement,
        ];
    }
private function getSoldeInitial($dateMin)
    {
        // Récupère le solde avant la date de début
        // Vous pouvez adapter cette logique selon votre système
        if (!$dateMin) {
            return 0;
        }

        $dateDebut = Carbon::parse($dateMin)->subDay();

        $entreesAvant = Paiement::where('date_paiement', '<', $dateDebut->format('Y-m-d'))
            ->sum('montant');

        $sortiesAvant = Depense::where('date_depense', '<', $dateDebut->format('Y-m-d'))
            ->where('statut', 'paye')
            ->sum('montant');

        return $entreesAvant - $sortiesAvant;
    }

     private function exportExcel($mouvements, $stats, $dateDebut, $dateFin, $search)
    {
        $filename = 'journal-caisse-' . $dateDebut . '-a-' . $dateFin;
        if ($search) {
            $filename .= '-recherche-' . substr($search, 0, 20);
        }
        $filename .= '.xlsx';

        return Excel::download(new CaisseExport($mouvements, $stats, $dateDebut, $dateFin), $filename);
    }

    private function exportPDF($mouvements, $stats, $dateDebut, $dateFin, $search)
    {
        $data = [
            'mouvements' => $mouvements,
            'stats' => $stats,
            'date_debut' => Carbon::parse($dateDebut)->format('d/m/Y'),
            'date_fin' => Carbon::parse($dateFin)->format('d/m/Y'),
            'search' => $search,
            'date_export' => now()->format('d/m/Y H:i'),
            'entete' => [
                'nom_ecole' => 'École Excellence',
                'adresse' => 'Avenue de la République, BP 1234 Lomé - Togo',
                'telephone' => '(+228) 22 21 21 21',
                'email' => 'contact@excellence.tg',
            ],
        ];

        $pdf = Pdf::loadView('exports.caisse-pdf', $data);

        $filename = 'journal-caisse-' . $dateDebut . '-a-' . $dateFin;
        if ($search) {
            $filename .= '-recherche-' . substr($search, 0, 20);
        }
        $filename .= '.pdf';

        return $pdf->stream($filename);
    }
}
