<?php

namespace App\Http\Controllers;

use App\Models\Professeur;
use App\Models\Classe;
use App\Models\Matiere;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfesseurController extends Controller
{
    public function index(Request $request)
    {
        $query = Professeur::query()
            ->with(['classe:id,nom_classe'])
            ->withCount('classes');

        // Recherche
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nom', 'LIKE', "%{$search}%")
                    ->orWhere('prenom', 'LIKE', "%{$search}%")
                    ->orWhere('matricule', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%");
            });
        }

        // Filtres
        if ($request->has('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        if ($request->has('type_contrat') && $request->type_contrat !== 'all') {
            $query->where('type_contrat', $request->type_contrat);
        }

        if ($request->has('niveau_etude') && $request->niveau_etude !== 'all') {
            $query->where('niveau_etude', $request->niveau_etude);
        }

        // Tri
        $sortBy = $request->sort_by ?? 'created_at';
        $sortDirection = $request->sort_direction ?? 'desc';
        $query->orderBy($sortBy, $sortDirection);

        // Pagination
        $perPage = $request->per_page ?? 15;
        $professeurs = $query->paginate($perPage);

        // Statistiques
        $stats = [
            'total' => Professeur::count(),
            'actifs' => Professeur::where('statut', 'actif')->count(),
            'suspendus' => Professeur::where('statut', 'suspendu')->count(),
            'inactifs' => Professeur::where('statut', 'inactif')->count(),
            'professeurs_principaux' => Professeur::whereNotNull('classe_id')->count(),
        ];

        // Options pour les filtres
        $statuts = [
            'actif' => 'Actif',
            'suspendu' => 'Suspendu',
            'inactif' => 'Inactif',
            'retraite' => 'Retraité',
        ];

        $typesContrat = [
            'cdi' => 'CDI',
            'cdd' => 'CDD',
            'vacataire' => 'Vacataire',
            'stagiare' => 'Stagiaire',
        ];

        $niveauxEtude = [
            'licence' => 'Licence',
            'master' => 'Master',
            'doctorat' => 'Doctorat',
            'autre' => 'Autre',
        ];

        return Inertia::render('Professeurs/Index', [
            'professeurs' => $professeurs,
            'filters' => $request->only(['search', 'statut', 'type_contrat', 'niveau_etude', 'per_page', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'statuts' => $statuts,
            'typesContrat' => $typesContrat,
            'niveauxEtude' => $niveauxEtude,
        ]);
    }

    public function create()
    {
        $classes = Classe::whereDoesntHave('professeurPrincipal')
            ->where('statut', 'active')
            ->select('id', 'nom_classe', 'niveau')
            ->orderBy('niveau')
            ->orderBy('nom_classe')
            ->get();

        $matieres = Matiere::where('est_active', true)
            ->select('id', 'nom', 'coefficient')
            ->orderBy('nom')
            ->get();

        return Inertia::render('Professeurs/Create', [
            'classes' => $classes,
            'matieres' => $matieres,
            'statuts' => [
                ['value' => 'actif', 'label' => 'Actif'],
                ['value' => 'suspendu', 'label' => 'Suspendu'],
                ['value' => 'inactif', 'label' => 'Inactif'],
                ['value' => 'retraite', 'label' => 'Retraité'],
            ],
            'typesContrat' => [
                ['value' => 'cdi', 'label' => 'CDI'],
                ['value' => 'cdd', 'label' => 'CDD'],
                ['value' => 'vacataire', 'label' => 'Vacataire'],
                ['value' => 'stagiare', 'label' => 'Stagiaire'],
            ],
            'niveauxEtude' => [
                ['value' => 'licence', 'label' => 'Licence'],
                ['value' => 'master', 'label' => 'Master'],
                ['value' => 'doctorat', 'label' => 'Doctorat'],
                ['value' => 'autre', 'label' => 'Autre'],
            ],
            'sexes' => [
                ['value' => 'M', 'label' => 'Masculin'],
                ['value' => 'F', 'label' => 'Féminin'],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Identité
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'date_naissance' => 'nullable|date',
            'sexe' => 'required|in:M,F',
            'lieu_naissance' => 'nullable|string|max:100',
            'nationalite' => 'required|string|max:50',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:professeurs,email',

            // Profession
            'statut' => 'required|in:actif,suspendu,inactif,retraite',
            'type_contrat' => 'required|in:cdi,cdd,vacataire,stagiare',
            'date_embauche' => 'required|date',
            'date_fin_contrat' => 'nullable|date|after:date_embauche',
            'salaire_base' => 'nullable|numeric|min:0',
            'numero_cnss' => 'nullable|string|max:50',
            'numero_compte_bancaire' => 'nullable|string|max:50',
            'nom_banque' => 'nullable|string|max:100',

            // Qualifications
            'niveau_etude' => 'required|in:licence,master,doctorat,autre',
            'diplome' => 'nullable|string|max:100',
            'specialite' => 'nullable|string|max:100',
            'etablissement' => 'nullable|string|max:200',
            'annee_obtention' => 'nullable|integer|min:1900|max:' . now()->year,

            // Matières et classes
            'matieres' => 'nullable|array',
            'matieres.*' => 'exists:matieres,id',
            'classe_id' => 'nullable|exists:classes,id',

            // Documents
            'photo' => 'nullable|image|max:2048',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'diplome_copie' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'contrat' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        // Générer le matricule
        $validated['matricule'] = Professeur::genererMatricule();


        // Gérer les fichiers
        $fileFields = ['photo', 'cv', 'diplome_copie', 'contrat'];
        foreach ($fileFields as $field) {
            if ($request->hasFile($field)) {
                $validated[$field] = $request->file($field)->store("professeurs/{$field}", 'public');
            }
        }

        // Créer le professeur
        $professeur = Professeur::create($validated);

        // Associer les matières
        if ($request->has('matieres')) {
            $professeur->matieresEnseignees()->attach($request->matieres);
        }

        // Si le professeur est désigné comme professeur principal
        if ($request->has('classe_id') && $request->classe_id) {
            $classe = Classe::find($request->classe_id);
            $classe->update(['professeur_principal_id' => $professeur->id]);
        }

        return redirect()
            ->route('professeurs.show', $professeur->id)
            ->with('success', "Professeur {$professeur->nom_complet} créé avec succès");
    }

    public function show(Professeur $professeur)
    {
        $professeur->load([
            'classe:id,nom_classe,niveau',

            'classes' => function ($query) {
                $query->withPivot('matiere_id', 'volume_horaire', 'jours_cours');
            },

            'matieresEnseignees:id,nom,coefficient',
            'createdBy:id,name,email',
            'updatedBy:id,name,email',
        ]);


        // Statistiques
        $stats = [
            'nombre_classes' => $professeur->classes->count(),
            'total_heures' => $professeur->classes->sum('pivot.volume_horaire'),
            'nombre_matieres' => $professeur->matieresEnseignees->count(),
        ];

        // Classes disponibles pour affectation
        $classesDisponibles = Classe::whereDoesntHave('professeurPrincipal')
            ->orWhere('professeur_principal_id', $professeur->id)
            ->where('statut', 'actif')
            ->select('id', 'nom_classe', 'niveau')
            ->orderBy('niveau')
            ->orderBy('nom_classe')
            ->get();


        return Inertia::render('Professeurs/Show', [
            'professeur' => $professeur,
            'stats' => $stats,
            'classesDisponibles' => $classesDisponibles,
        ]);
    }

    public function edit(Professeur $professeur)
    {
        $classes = Classe::where(function ($query) use ($professeur) {
            $query->whereDoesntHave('professeurPrincipal')
                ->orWhere('professeur_principal_id', $professeur->id);
        })
            ->where('statut', 'actif')
            ->select('id', 'nom_classe', 'niveau')
            ->orderBy('niveau')
            ->orderBy('nom_classe')
            ->get();

        $matieres = Matiere::where('est_active', true)
            ->select('id', 'nom', 'coefficient')
            ->orderBy('nom')
            ->get();

        $professeur->load('matieresEnseignees:id');

        return Inertia::render('Professeurs/Edit', [
            'professeur' => $professeur,
            'classes' => $classes,
            'matieres' => $matieres,
            'matieresSelectionnees' => $professeur->matieresEnseignees->pluck('id')->toArray(),
            'statuts' => [
                ['value' => 'actif', 'label' => 'Actif'],
                ['value' => 'suspendu', 'label' => 'Suspendu'],
                ['value' => 'inactif', 'label' => 'Inactif'],
                ['value' => 'retraite', 'label' => 'Retraité'],
            ],
            'typesContrat' => [
                ['value' => 'cdi', 'label' => 'CDI'],
                ['value' => 'cdd', 'label' => 'CDD'],
                ['value' => 'vacataire', 'label' => 'Vacataire'],
                ['value' => 'stagiare', 'label' => 'Stagiaire'],
            ],
            'niveauxEtude' => [
                ['value' => 'licence', 'label' => 'Licence'],
                ['value' => 'master', 'label' => 'Master'],
                ['value' => 'doctorat', 'label' => 'Doctorat'],
                ['value' => 'autre', 'label' => 'Autre'],
            ],
            'sexes' => [
                ['value' => 'M', 'label' => 'Masculin'],
                ['value' => 'F', 'label' => 'Féminin'],
            ],
        ]);
    }

    public function update(Request $request, Professeur $professeur)
    {
        $validated = $request->validate([
            // Identité
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'date_naissance' => 'nullable|date',
            'sexe' => 'required|in:M,F',
            'lieu_naissance' => 'nullable|string|max:100',
            'nationalite' => 'required|string|max:50',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'email' => ['nullable', 'email', Rule::unique('professeurs')->ignore($professeur->id)],

            // Profession
            'statut' => 'required|in:actif,suspendu,inactif,retraite',
            'type_contrat' => 'required|in:cdi,cdd,vacataire,stagiare',
            'date_embauche' => 'required|date',
            'date_fin_contrat' => 'nullable|date|after:date_embauche',
            'salaire_base' => 'nullable|numeric|min:0',
            'numero_cnss' => 'nullable|string|max:50',
            'numero_compte_bancaire' => 'nullable|string|max:50',
            'nom_banque' => 'nullable|string|max:100',

            // Qualifications
            'niveau_etude' => 'required|in:licence,master,doctorat,autre',
            'diplome' => 'nullable|string|max:100',
            'specialite' => 'nullable|string|max:100',
            'etablissement' => 'nullable|string|max:200',
            'annee_obtention' => 'nullable|integer|min:1900|max:' . now()->year,

            // Matières et classes
            'matieres' => 'nullable|array',
            'matieres.*' => 'exists:matieres,id',
            'classe_id' => 'nullable|exists:classes,id',

            // Documents
            'photo' => 'nullable|image|max:2048',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'diplome_copie' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'contrat' => 'nullable|file|mimes:pdf|max:5120',
        ]);

        // Gérer les fichiers
        $fileFields = ['photo', 'cv', 'diplome_copie', 'contrat'];
        foreach ($fileFields as $field) {
            if ($request->hasFile($field)) {
                $validated[$field] = $request->file($field)->store("professeurs/{$field}", 'public');
            } elseif ($request->has("{$field}_remove") && $request->{"{$field}_remove"} === true) {
                $validated[$field] = null;
            }
        }


        // Mettre à jour le professeur
        $professeur->update($validated);

        // Mettre à jour les matières
        if ($request->has('matieres')) {
            $professeur->matieresEnseignees()->sync($request->matieres);
        } else {
            $professeur->matieresEnseignees()->detach();
        }

        // Gérer la classe (professeur principal)
        $ancienneClasseId = $professeur->classe_id;
        $nouvelleClasseId = $request->classe_id;

        if ($ancienneClasseId != $nouvelleClasseId) {
            // Retirer l'ancienne classe
            if ($ancienneClasseId) {
                Classe::where('id', $ancienneClasseId)
                    ->where('professeur_principal_id', $professeur->id)
                    ->update(['professeur_principal_id' => null]);
            }

            // Assigner la nouvelle classe
            if ($nouvelleClasseId) {
                Classe::where('id', $nouvelleClasseId)
                    ->update(['professeur_principal_id' => $professeur->id]);
            }
        }

        return redirect()
            ->route('professeurs.show', $professeur)
            ->with('success', "Professeur {$professeur->nom_complet} mis à jour avec succès");
    }

    public function destroy(Professeur $professeur)
    {
        // Vérifier si le professeur est professeur principal
        if ($professeur->classe) {
            return redirect()
                ->route('professeurs.index')
                ->with('error', "Impossible de supprimer ce professeur car il est professeur principal de la classe {$professeur->classe->nom_classe}");
        }

        // Vérifier si le professeur donne des cours
        if ($professeur->classes()->count() > 0) {
            return redirect()
                ->route('professeurs.index')
                ->with('error', "Impossible de supprimer ce professeur car il donne des cours. Dissociez-le d'abord des classes.");
        }

        $professeur->delete();

        return redirect()
            ->route('professeurs.index')
            ->with('success', "Professeur supprimé avec succès");
    }

    /**
     * Affecter un professeur à une classe pour une matière
     */
    public function affecterClasse(Request $request, Professeur $professeur)
    {
        $request->validate([
            'classe_id' => 'required|exists:classes,id',
            'matiere_id' => 'required|exists:matieres,id',
            'volume_horaire' => 'required|integer|min:1|max:40',
            'jours_cours' => 'nullable|array',
            'jours_cours.*' => 'in:lundi,mardi,mercredi,jeudi,vendredi,samedi',
        ]);

        // Vérifier si l'affectation existe déjà
        $existe = $professeur->classes()
            ->where('classe_id', $request->classe_id)
            ->wherePivot('matiere_id', $request->matiere_id)
            ->exists();

        if ($existe) {
            return back()->with('error', 'Ce professeur est déjà affecté à cette classe pour cette matière');
        }

        // Affecter
        $professeur->classes()->attach($request->classe_id, [
            'matiere_id' => $request->matiere_id,
            'volume_horaire' => $request->volume_horaire,
            'jours_cours' => $request->jours_cours ? json_encode($request->jours_cours) : null,
        ]);

        return back()->with('success', 'Professeur affecté à la classe avec succès');
    }

    /**
     * Désaffecter un professeur d'une classe
     */
    public function desaffecterClasse(Professeur $professeur, $classeId, $matiereId)
    {
        $professeur->classes()
            ->wherePivot('classe_id', $classeId)
            ->wherePivot('matiere_id', $matiereId)
            ->detach();

        return back()->with('success', 'Professeur désaffecté de la classe avec succès');
    }

    /**
     * Actions groupées
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:professeurs,id',
            'action' => 'required|in:activate,suspend,delete',
        ]);

        $ids = $request->ids;

        switch ($request->action) {
            case 'activate':
                Professeur::whereIn('id', $ids)->update(['statut' => 'actif']);
                $message = count($ids) . ' professeur(s) activé(s)';
                break;

            case 'suspend':
                Professeur::whereIn('id', $ids)->update(['statut' => 'suspendu']);
                $message = count($ids) . ' professeur(s) suspendu(s)';
                break;

            case 'delete':
                // Vérifier si des professeurs sont professeurs principaux
                $professeursPrincipaux = Professeur::whereIn('id', $ids)
                    ->whereNotNull('classe_id')
                    ->exists();

                if ($professeursPrincipaux) {
                    return back()->with('error', 'Certains professeurs sont professeurs principaux');
                }

                // Vérifier si des professeurs donnent des cours
                $avecClasses = Professeur::whereIn('id', $ids)
                    ->whereHas('classes')
                    ->exists();

                if ($avecClasses) {
                    return back()->with('error', 'Certains professeurs donnent des cours');
                }

                Professeur::whereIn('id', $ids)->delete();
                $message = count($ids) . ' professeur(s) supprimé(s)';
                break;
        }

        return back()->with('success', $message);
    }
}
