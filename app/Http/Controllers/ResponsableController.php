<?php

namespace App\Http\Controllers;

use App\Models\ConfigurationFrai;
use App\Models\Responsable;
use App\Models\Eleve;
use App\Models\Paiement;
use App\Models\Tranche;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ResponsableController extends Controller
{
    public function index(Request $request)
    {
        $query = Responsable::withCount('eleves')->with('eleves.classe');

        // Filtres
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('telephone_1', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('type_responsable') && $request->type_responsable !== 'all') {
            $query->where('type_responsable', $request->type_responsable);
        }

        if ($request->has('est_actif') && $request->est_actif !== 'all') {
            $estActif = $request->est_actif === 'true';
            if ($estActif) {
                $query->whereHas('eleves', function ($q) {
                    $q->where('statut', 'actif');
                });
            } else {
                $query->whereDoesntHave('eleves', function ($q) {
                    $q->where('statut', 'actif');
                });
            }
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        // Pagination
        $perPage = $request->get('per_page', 10);
        $responsables = $query->paginate($perPage);

        // Statistiques
        $stats = [
            'total' => Responsable::count(),
            'avec_eleves' => Responsable::has('eleves')->count(),
            'pere' => Responsable::where('type_responsable', 'pere')->count(),
            'mere' => Responsable::where('type_responsable', 'mere')->count(),
            'tuteur' => Responsable::where('type_responsable', 'tuteur')->count(),
        ];

        // Types de responsables
        $typesResponsable = [
            'all' => 'Tous types',
            'pere' => 'Père',
            'mere' => 'Mère',
            'tuteur' => 'Tuteur',
            'autre' => 'Autre',
        ];

        return Inertia::render('Responsables/Index', [
            'responsables' => $responsables,
            'filters' => $request->only(['search', 'type_responsable', 'est_actif', 'per_page', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'typesResponsable' => $typesResponsable,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        $eleves = Eleve::actif()
            ->select('id', 'matricule', 'nom', 'prenom', 'classe_id')
            ->with('classe:id,nom_classe')
            ->get();

        $typesResponsable = [
            'pere' => 'Père',
            'mere' => 'Mère',
            'tuteur' => 'Tuteur',
            'autre' => 'Autre',
        ];

        return Inertia::render('Responsables/Create', [
            'eleves' => $eleves,
            'typesResponsable' => [
                ['value' => 'pere', 'label' => 'Père'],
                ['value' => 'mere', 'label' => 'Mère'],
                ['value' => 'tuteur', 'label' => 'Tuteur'],
                ['value' => 'autre', 'label' => 'Autre'],
            ],
            'situationsMatrimoniales' => [
                ['value' => 'marie', 'label' => 'Marié(e)'],
                ['value' => 'celibataire', 'label' => 'Célibataire'],
                ['value' => 'divorce', 'label' => 'Divorcé(e)'],
                ['value' => 'veuf', 'label' => 'Veuf/Veuve'],
            ],
            'niveauxEtude' => [
                ['value' => 'primaire', 'label' => 'Primaire'],
                ['value' => 'secondaire', 'label' => 'Secondaire'],
                ['value' => 'universitaire', 'label' => 'Universitaire'],
                ['value' => 'aucun', 'label' => 'Aucun'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'type_responsable' => 'required|in:pere,mere,tuteur,autre',
            'cin' => 'nullable|string|max:20|unique:responsables,cin',
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string|max:100',
            'sexe' => 'required|in:M,F',
            'profession' => 'nullable|string|max:100',
            'entreprise' => 'nullable|string|max:100',
            'poste' => 'nullable|string|max:100',
            'revenu_mensuel' => 'nullable|numeric|min:0',

            // Coordonnées
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:100',
            'pays' => 'nullable|string|max:50',
            'telephone_1' => 'required|string|max:20',
            'telephone_2' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:responsables,email',

            // Informations supplémentaires
            'situation_matrimoniale' => 'nullable|in:marie,celibataire,divorce,veuf',
            'niveau_etude' => 'nullable|in:primaire,secondaire,universitaire,aucun',
            'observations' => 'nullable|string|max:500',

            // Élèves à associer
            'eleves' => 'nullable|array',
            'eleves.*.id' => 'required|exists:eleves,id',
            'eleves.*.lien' => 'required|in:pere,mere,tuteur_legal,grand_parent,oncle_tante,frere_soeur,autre',
            'eleves.*.est_responsable_financier' => 'boolean',
            'eleves.*.est_contact_urgence' => 'boolean',
            'eleves.*.est_autorise_retirer' => 'boolean',
            'eleves.*.ordre_priorite' => 'integer|min:1',
        ]);

        DB::beginTransaction();
        try {

            // Créer le responsable
            $responsable = Responsable::create($validated);

            // Associer les élèves si spécifiés
            if ($request->has('eleves')) {
                foreach ($request->eleves as $eleveData) {
                    $responsable->eleves()->attach($eleveData['id'], [
                        'lien_parental' => $eleveData['lien'],
                        'est_responsable_financier' => $eleveData['est_responsable_financier'] ?? false,
                        'est_contact_urgence' => $eleveData['est_contact_urgence'] ?? false,
                        'est_autorise_retirer' => $eleveData['est_autorise_retirer'] ?? false,
                        'ordre_priorite' => $eleveData['ordre_priorite'] ?? 1,
                    ]);

                    // Mettre à jour le responsable principal si c'est le premier
                    if (($eleveData['ordre_priorite'] ?? 1) === 1) {
                        $eleve = Eleve::find($eleveData['id']);
                        $eleve->update(['responsable_principal_id' => $responsable->id]);
                    }
                }
            }

            DB::commit();

            return redirect()
                ->route('responsables.show', $responsable)
                ->with('success', "Responsable {$responsable->nom_complet} créé avec succès.");
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Une erreur est survenue lors de la création du responsable.');
        }
    }

    public function show(Responsable $responsable)
    {
        $responsable->load([
            'eleves.classe',
            'eleves.responsables' => function ($query) use ($responsable) {
                $query->where('responsables.id', '!=', $responsable->id);
            },
            'eleves.paiements' => function ($query) {
                $query->with(['tranche.configurationFrais', 'user'])
                    ->orderBy('date_paiement', 'desc')
                    ->limit(10);
            },
            'createdBy:id,name,email',
            'updatedBy:id,name,email',
        ]);

        // Charger les informations financières depuis les paiements
        $informationsFinancieres = [];

        // Récupérer les paiements pour les élèves dont le responsable est financier
        foreach ($responsable->eleves as $eleve) {
            $pivot = $eleve->pivot;
            if ($pivot->est_responsable_financier) {
                $montantTotalPaye = $eleve->paiements->sum('montant');
                $derniersPaiements = $eleve->paiements->take(5);

                $informationsFinancieres[] = [
                    'eleve_id' => $eleve->id,
                    'eleve_nom' => $eleve->nom_complet,
                    'eleve_matricule' => $eleve->matricule,
                    'montant_total_paye' => $montantTotalPaye,
                    'derniers_paiements' => $derniersPaiements,
                    'nombre_paiements' => $eleve->paiements->count(),
                ];
            }
        }

        // Calculer les statistiques financières
        $statistiques = [
            'total_paye' => collect($informationsFinancieres)->sum('montant_total_paye'),
            'nombre_eleves_financiers' => $responsable->eleves()
                ->wherePivot('est_responsable_financier', true)
                ->count(),
            'nombre_paiements_total' => collect($informationsFinancieres)->sum('nombre_paiements'),
        ];

        return Inertia::render('Responsables/Show', [
            'responsable' => $responsable,
            'informationsFinancieres' => $informationsFinancieres,
            'statistiques' => $statistiques,
        ]);
    }

    public function eleves(Responsable $responsable)
    {
        $eleves = $responsable->eleves()
            ->with(['classe:id,nom_classe,niveau', 'paiements'])
            ->get();

        $elevesDisponibles = Eleve::actif()
            ->whereDoesntHave('responsables', function ($query) use ($responsable) {
                $query->where('responsables.id', $responsable->id);
            })
            ->select('id', 'matricule', 'nom', 'prenom', 'classe_id')
            ->with(['classe:id,nom_classe', 'paiements'])
            ->get()
            ->map(function ($eleve) {
                $eleve->montant_total_paye = $eleve->paiements->sum('montant');
                $eleve->dernier_paiement = $eleve->paiements->sortByDesc('date_paiement')->first();
                return $eleve;
            });

        $typesLien = [
            'pere' => 'Père',
            'mere' => 'Mère',
            'tuteur_legal' => 'Tuteur légal',
            'grand_parent' => 'Grand-parent',
            'oncle_tante' => 'Oncle/Tante',
            'frere_soeur' => 'Frère/Sœur',
            'autre' => 'Autre',
        ];

        return Inertia::render('Responsables/Eleves', [
            'responsable' => $responsable,
            'eleves' => $eleves,
            'elevesDisponibles' => $elevesDisponibles,
            'typesLien' => $typesLien,
        ]);
    }

    public function edit(Responsable $responsable)
    {
        $eleves = Eleve::actif()
            ->select('id', 'matricule', 'nom', 'prenom', 'classe_id')
            ->with('classe:id,nom_classe')
            ->get();

        // Charger les relations actuelles
        $responsable->load('eleves:id,matricule,nom,prenom');


        return Inertia::render('Responsables/Edit', [
            'responsable' => $responsable,
            'typesResponsable' => [
                ['value' => 'pere', 'label' => 'Père'],
                ['value' => 'mere', 'label' => 'Mère'],
                ['value' => 'tuteur', 'label' => 'Tuteur'],
                ['value' => 'autre', 'label' => 'Autre'],
            ],
            'situationsMatrimoniales' => [
                ['value' => 'marie', 'label' => 'Marié(e)'],
                ['value' => 'celibataire', 'label' => 'Célibataire'],
                ['value' => 'divorce', 'label' => 'Divorcé(e)'],
                ['value' => 'veuf', 'label' => 'Veuf/Veuve'],
            ],
            'niveauxEtude' => [
                ['value' => 'primaire', 'label' => 'Primaire'],
                ['value' => 'secondaire', 'label' => 'Secondaire'],
                ['value' => 'universitaire', 'label' => 'Universitaire'],
                ['value' => 'aucun', 'label' => 'Aucun'],
            ],
        ]);
    }

    public function update(Request $request, Responsable $responsable)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'type_responsable' => 'required|in:pere,mere,tuteur,autre',
            'cin' => [
                'nullable',
                'string',
                'max:20',
                Rule::unique('responsables')->ignore($responsable->id),
            ],
            'date_naissance' => 'nullable|date',
            'lieu_naissance' => 'nullable|string|max:100',
            'sexe' => 'required|in:M,F',
            'profession' => 'nullable|string|max:100',
            'entreprise' => 'nullable|string|max:100',
            'poste' => 'nullable|string|max:100',
            'revenu_mensuel' => 'nullable|numeric|min:0',

            // Coordonnées
            'adresse' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:100',
            'pays' => 'nullable|string|max:50',
            'telephone_1' => 'required|string|max:20',
            'telephone_2' => 'nullable|string|max:20',
            'email' => [
                'nullable',
                'email',
                Rule::unique('responsables')->ignore($responsable->id),
            ],

            // Informations supplémentaires
            'situation_matrimoniale' => 'nullable|in:marie,celibataire,divorce,veuf',
            'niveau_etude' => 'nullable|in:primaire,secondaire,universitaire,aucun',
            'observations' => 'nullable|string|max:500',
        ]);

        $responsable->update($validated);

        return redirect()
            ->route('responsables.show', $responsable)
            ->with('success', "Responsable {$responsable->nom_complet} mis à jour avec succès.");
    }

    public function destroy(Responsable $responsable)
    {
        if ($responsable->eleves()->count() > 0) {
            return back()->with('error', 'Impossible de supprimer ce responsable car il est associé à des élèves.');
        }

        $responsable->delete();

        return redirect()
            ->route('responsables.index')
            ->with('success', "Responsable {$responsable->nom_complet} supprimé avec succès.");
    }



    public function attachEleve(Request $request, Responsable $responsable)
    {
        $validated = $request->validate([
            'eleve_id' => 'required|exists:eleves,id',
            'lien' => 'required|in:pere,mere,tuteur_legal,grand_parent,oncle_tante,frere_soeur,autre',
            'est_responsable_financier' => 'boolean',
            'est_contact_urgence' => 'boolean',
            'est_autorise_retirer' => 'boolean',
            'ordre_priorite' => 'integer|min:1',
        ]);

        // Vérifier si l'élève n'est pas déjà associé
        if ($responsable->eleves()->where('eleve_id', $validated['eleve_id'])->exists()) {
            return back()->with('error', 'Cet élève est déjà associé à ce responsable.');
        }

        $responsable->eleves()->attach($validated['eleve_id'], [
            'lien_parental' => $validated['lien'],
            'est_responsable_financier' => $validated['est_responsable_financier'] ?? false,
            'est_contact_urgence' => $validated['est_contact_urgence'] ?? false,
            'est_autorise_retirer' => $validated['est_autorise_retirer'] ?? false,
            'ordre_priorite' => $validated['ordre_priorite'] ?? 1,
        ]);

        // Mettre à jour le responsable principal si premier responsable
        if (($validated['ordre_priorite'] ?? 1) === 1) {
            $eleve = Eleve::find($validated['eleve_id']);
            $eleve->update(['responsable_principal_id' => $responsable->id]);
        }

        return back()->with('success', 'Élève associé avec succès.');
    }

    public function detachEleve(Responsable $responsable, Eleve $eleve)
    {
        $responsable->eleves()->detach($eleve->id);

        // Si c'était le responsable principal, le retirer
        if ($eleve->responsable_principal_id === $responsable->id) {
            // Trouver un autre responsable financier
            $autreResponsable = $eleve->responsables()
                ->where('responsables.id', '!=', $responsable->id)
                ->wherePivot('est_responsable_financier', true)
                ->first();

            $eleve->update([
                'responsable_principal_id' => $autreResponsable?->id
            ]);
        }

        return back()->with('success', 'Élève dissocié avec succès.');
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:responsables,id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $ids = $request->ids;

        switch ($request->action) {
            case 'activate':
                // Activer (associer à des élèves actifs)
                // Cette logique dépend de votre métier
                break;

            case 'deactivate':
                // Désactiver (dissocier des élèves actifs)
                // Cette logique dépend de votre métier
                break;

            case 'delete':
                // Supprimer uniquement les responsables sans élèves
                $responsables = Responsable::whereIn('id', $ids)
                    ->whereDoesntHave('eleves')
                    ->delete();

                return back()->with('success', count($responsables) . ' responsable(s) supprimé(s) avec succès.');
        }

        return back()->with('success', 'Action effectuée avec succès.');
    }













    public function relever(Request $request, Responsable $responsable)
    {
        // Récupérer les élèves du responsable
        $eleves = $responsable->eleves()
            ->with(['classe:id,nom_classe'])
            ->select(
                'eleves.id',
                'eleves.matricule',
                'eleves.nom',
                'eleves.prenom',
                'eleves.classe_id'
            )
            ->orderBy('eleves.nom')
            ->orderBy('eleves.prenom')
            ->get();


        // Récupérer les paiements des élèves
        $query = Paiement::query()
            ->with(['eleve:id,matricule,nom,prenom,classe_id', 'eleve.classe:id,nom_classe', 'tranche', 'user:id,name'])
            ->whereIn('eleve_id', $eleves->pluck('id'));

        // Filtres
        $filters = [];

        if ($request->has('eleve_id') && $request->eleve_id !== 'all') {
            $query->where('eleve_id', $request->eleve_id);
            $filters['eleve_id'] = $request->eleve_id;
        }

        if ($request->has('tranche_id') && $request->tranche_id !== 'all') {
            $query->where('tranche_id', $request->tranche_id);
            $filters['tranche_id'] = $request->tranche_id;
        }

        if ($request->has('annee_scolaire') && $request->annee_scolaire !== 'all') {
            $query->whereHas('tranche', function ($q) use ($request) {
                $q->where('annee_scolaire', $request->annee_scolaire);
            });
            $filters['annee_scolaire'] = $request->annee_scolaire;
        }

        if ($request->has('date_debut') && $request->date_debut) {
            $query->whereDate('date_paiement', '>=', $request->date_debut);
            $filters['date_debut'] = $request->date_debut;
        }

        if ($request->has('date_fin') && $request->date_fin) {
            $query->whereDate('date_paiement', '<=', $request->date_fin);
            $filters['date_fin'] = $request->date_fin;
        }

        // Récupérer avec pagination ou sans pour l'export
        if ($request->has('export') && $request->export === 'pdf') {
            $paiements = $query->orderBy('date_paiement', 'desc')->get();
        } else {
            $perPage = $request->per_page ?? 25;
            $paiements = $query->orderBy('date_paiement', 'desc')->paginate($perPage);
        }

        // Statistiques
        $totalMontant = $paiements->sum('montant');

        $statsParEleve = $eleves->map(function ($eleve) {
            $totalEleve = Paiement::where('eleve_id', $eleve->id)->sum('montant');
            return [
                'id' => $eleve->id,
                'nom_complet' => $eleve->nom_complet,
                'matricule' => $eleve->matricule,
                'classe' => $eleve->classe->nom_classe,
                'total_paye' => $totalEleve,
            ];
        });

        // Options pour les filtres
        $tranches = Tranche::with('configurationFrais:id,annee_scolaire')
            ->select('id', 'nom_tranche', 'montant', 'configuration_frai_id', 'date_limite')
            ->orderBy('date_limite', 'desc')
            ->get();

        $annees = ConfigurationFrai::query()
            ->distinct()
            ->orderByDesc('annee_scolaire')
            ->pluck('annee_scolaire')
            ->values();


        // Retourner la vue ou le PDF
        if ($request->has('export') && $request->export === 'pdf') {
            return $this->generateRelevePdf($responsable, $paiements, $statsParEleve, $totalMontant, $filters);
        }

        return Inertia::render('Responsables/Relever', [
            'responsable' => [
                'id' => $responsable->id,
                'nom_complet' => $responsable->nom_complet,
                'telephone_1' => $responsable->telephone_1,
                'email' => $responsable->email,
                'adresse' => $responsable->adresse,
            ],
            'paiements' => $paiements,
            'eleves' => $eleves,
            'tranches' => $tranches,
            'annees' => $annees,
            'filters' => $filters,
            'stats' => [
                'total_eleves' => $eleves->count(),
                'total_paiements' => $paiements->count(),
                'total_montant' => $totalMontant,
                'stats_par_eleve' => $statsParEleve,
            ],
        ]);
    }

    /**
     * Générer le PDF du relevé
     */
    private function generateRelevePdf($responsable, $paiements, $statsParEleve, $totalMontant, $filters)
    {
        $data = [
            'responsable' => $responsable,
            'paiements' => $paiements,
            'statsParEleve' => $statsParEleve,
            'totalMontant' => $totalMontant,
            'filters' => $filters,
            'dateGeneration' => now()->format('d/m/Y H:i'),
        ];

        $pdf = PDF::loadView('pdf.releve-responsable', $data);

        $filename = "releve-paiements-{$responsable->id}-" . now()->format('Ymd-His') . ".pdf";

        return $pdf->stream($filename);
    }

    /**
     * Générer le relevé pour un élève spécifique
     */
    public function releverEleve(Request $request, Responsable $responsable, Eleve $eleve)
    {
        // Vérifier que l'élève appartient bien au responsable
        if (!$responsable->eleves()->where('eleve_id', $eleve->id)->exists()) {
            abort(403, "Cet élève n'est pas associé à ce responsable");
        }

        $query = Paiement::query()
            ->with(['tranche', 'user:id,name'])
            ->where('eleve_id', $eleve->id);

        // Filtres
        $filters = [];

        if ($request->has('tranche_id') && $request->tranche_id !== 'all') {
            $query->where('tranche_id', $request->tranche_id);
            $filters['tranche_id'] = $request->tranche_id;
        }

        if ($request->has('annee_scolaire') && $request->annee_scolaire !== 'all') {
            $query->whereHas('tranche', function ($q) use ($request) {
                $q->where('annee_scolaire', $request->annee_scolaire);
            });
            $filters['annee_scolaire'] = $request->annee_scolaire;
        }

        $paiements = $query->orderBy('date_paiement', 'desc')->get();

        $totalMontant = $paiements->sum('montant');

        if ($request->has('export') && $request->export === 'pdf') {
            $data = [
                'responsable' => $responsable,
                'eleve' => $eleve,
                'paiements' => $paiements,
                'totalMontant' => $totalMontant,
                'filters' => $filters,
                'dateGeneration' => now()->format('d/m/Y H:i'),
            ];

            $pdf = Pdf::loadView('pdf.releve-eleve', $data);
            $filename = "releve-paiements-{$responsable->id}-{$eleve->id}-" . now()->format('Ymd-His') . ".pdf";

            return $pdf->download($filename);
        }

        return Inertia::render('Responsables/ReleverEleve', [
            'responsable' => $responsable,
            'eleve' => $eleve,
            'paiements' => $paiements,
            'totalMontant' => $totalMontant,
            'filters' => $filters,
        ]);
    }
}
