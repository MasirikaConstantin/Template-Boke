<?php

namespace App\Http\Controllers;

use App\Models\Eleve;
use App\Models\Classe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class EleveController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $classe_id = $request->input('classe_id');
        $statut = $request->input('statut');
        $sexe = $request->input('sexe');
        $perPage = $request->input('per_page', 15);
        $sortBy = $request->input('sort_by', 'nom');
        $sortDirection = $request->input('sort_direction', 'asc');

        $eleves = Eleve::query()
            ->with(['classe:id,nom_classe,niveau,section'])
            ->when($search, fn($q) => $q->search($search))
            ->when($classe_id, fn($q) => $q->where('classe_id', $classe_id))
            ->when($statut, fn($q) => $q->where('statut', $statut))
            ->when($sexe, fn($q) => $q->where('sexe', $sexe))
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        // Statistiques
        $stats = [
            'total' => Eleve::count(),
            'actifs' => Eleve::actif()->count(),
            'garcons' => Eleve::where('sexe', 'M')->count(),
            'filles' => Eleve::where('sexe', 'F')->count(),
            'redoublants' => Eleve::redoublants()->count(),
            'par_classe' => Classe::withCount(['eleves as eleves_count' => function ($q) {
                $q->where('statut', 'actif');
            }])->get()->pluck('eleves_count', 'nom_classe'),
        ];

        // Classes pour le filtre
        $classes = Classe::active()->select('id', 'nom_classe', 'niveau')->get();

        return Inertia::render('Eleves/Index', [
            'eleves' => $eleves,
            'filters' => [
                'search' => $search,
                'classe_id' => $classe_id,
                'statut' => $statut,
                'sexe' => $sexe,
                'per_page' => $perPage,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'stats' => $stats,
            'classes' => $classes,
        ]);
    }

    public function create()
    {
        $classes = Classe::active()->select('id', 'nom_classe', 'niveau', 'section')->get();
        
        return Inertia::render('Eleves/Create', [
            'classes' => $classes,
            'nationalites' => [
                'Sénégalais',
                'Mauritanien',
                'Malien',
                'Guinéen',
                'Ivoirien',
                'Burkinabé',
                'Nigerien',
                'Togolais',
                'Béninois',
                'Autre',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Identité
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'sexe' => 'required|in:M,F',
            'lieu_naissance' => 'nullable|string|max:100',
            'nationalite' => 'required|string|max:50',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'email' => 'nullable|email|unique:eleves,email',
            
            // Parents
            'nom_pere' => 'nullable|string|max:100',
            'profession_pere' => 'nullable|string|max:100',
            'telephone_pere' => 'nullable|string|max:20',
            'nom_mere' => 'nullable|string|max:100',
            'profession_mere' => 'nullable|string|max:100',
            'telephone_mere' => 'nullable|string|max:20',
            'nom_tuteur' => 'nullable|string|max:100',
            'profession_tuteur' => 'nullable|string|max:100',
            'telephone_tuteur' => 'nullable|string|max:20',
            'adresse_tuteur' => 'nullable|string|max:255',
            
            // Scolarité
            'classe_id' => 'required|exists:classes,id',
            'redoublant' => 'boolean',
            'annee_redoublement' => 'nullable|integer|min:2000|max:' . now()->year,
            'derniere_ecole' => 'nullable|string|max:200',
            'derniere_classe' => 'nullable|string|max:50',
            
            // Santé
            'antecedents_medicaux' => 'nullable|string',
            'groupe_sanguin' => 'nullable|string|max:5',
            'allergies' => 'nullable|string',
            'medecin_traitant' => 'nullable|string|max:100',
            'telephone_medecin' => 'nullable|string|max:20',
            
            // Transport
            'moyen_transport' => 'nullable|in:marche,bus,voiture,taxi,autre',
            'nom_transporteur' => 'nullable|string|max:100',
            'telephone_transporteur' => 'nullable|string|max:20',
            
            // Documents (fichiers)
            'photo' => 'nullable|image|max:2048',
            'certificat_naissance' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'bulletin_precedent' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'certificat_medical' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            'autorisation_parentale' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
            
            // Observations
            'observations' => 'nullable|string|max:500',
        ]);

        // Gérer les fichiers
        $fileFields = ['photo', 'certificat_naissance', 'bulletin_precedent', 'certificat_medical', 'autorisation_parentale'];
        foreach ($fileFields as $field) {
            if ($request->hasFile($field)) {
                $validated[$field] = $request->file($field)->store("eleves/{$field}", 'public');
            }
        }

        // Date d'inscription par défaut
        $validated['date_inscription'] = now();
        $validated['statut'] = 'actif';
        $validated['created_by'] = auth()->id();

        $eleve = Eleve::create($validated);

        return redirect()
            ->route('eleves.index')
            ->with('success', "Élève {$eleve->nom_complet} créé avec succès. Matricule: {$eleve->matricule}");
    }

    public function show(string $eleve)
    {
        $eleve = Eleve::findorFail($eleve);
        $eleve->load([
            'classe:id,nom_classe,niveau,section,professeur_principal_id',
            'classe.professeurPrincipal:id,name,email',
            'createdBy:id,name,email',
            'updatedBy:id,name,email',
            'notes' => function ($q) {
                $q->with('matiere:id,nom,coefficient')
                  ->orderBy('created_at', 'desc')
                  ->limit(10);
            },
            'absences' => function ($q) {
                $q->orderBy('date_absence', 'desc')
                  ->limit(10);
            },
            'paiements' => function ($q) {
                $q->orderBy('created_at', 'desc')
                  ->limit(10);
            },
            'logs' => function ($q) {
                $q->with('user:id,name')
                  ->latest()
                  ->limit(10);
            },
        ]);

        // Calculer la moyenne actuelle
        $eleve->moyenne_actuelle = $eleve->calculerMoyenne();

        return Inertia::render('Eleves/Show', [
            'eleve' => $eleve,
        ]);
    }

    public function edit(Eleve $eleve)
    {
        $eleve->load('classe:id,nom_classe,niveau');
        
        $classes = Classe::active()->select('id', 'nom_classe', 'niveau', 'section')->get();
        
        return Inertia::render('Eleves/Edit', [
            'eleve' => $eleve,
            'classes' => $classes,
            'nationalites' => [
                'Congolaise DRC',
                'Congolaise Braza',
                'Sénégalais',
                'Mauritanien',
                'Malien',
                'Guinéen',
                'Ivoirien',
                'Burkinabé',
                'Nigerien',
                'Togolais',
                'Béninois',
                'Autre',
            ],
        ]);
    }

    public function update(Request $request, Eleve $eleve)
    {
        $oldData = $eleve->toArray();
        
        $validated = $request->validate([
            // Identité
            'nom' => 'required|string|max:100',
            'prenom' => 'required|string|max:100',
            'date_naissance' => 'required|date',
            'sexe' => 'required|in:M,F',
            'lieu_naissance' => 'nullable|string|max:100',
            'nationalite' => 'required|string|max:50',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'email' => [
                'nullable',
                'email',
                Rule::unique('eleves')->ignore($eleve->id),
            ],
            
            // Parents
            'nom_pere' => 'nullable|string|max:100',
            'profession_pere' => 'nullable|string|max:100',
            'telephone_pere' => 'nullable|string|max:20',
            'nom_mere' => 'nullable|string|max:100',
            'profession_mere' => 'nullable|string|max:100',
            'telephone_mere' => 'nullable|string|max:20',
            'nom_tuteur' => 'nullable|string|max:100',
            'profession_tuteur' => 'nullable|string|max:100',
            'telephone_tuteur' => 'nullable|string|max:20',
            'adresse_tuteur' => 'nullable|string|max:255',
            
            // Scolarité
            'classe_id' => 'required|exists:classes,id',
            'statut' => 'required|in:actif,inactif,transfere,exclus,diplome',
            'redoublant' => 'boolean',
            'annee_redoublement' => 'nullable|integer|min:2000|max:' . now()->year,
            'derniere_ecole' => 'nullable|string|max:200',
            'derniere_classe' => 'nullable|string|max:50',
            
            // Santé
            'antecedents_medicaux' => 'nullable|string',
            'groupe_sanguin' => 'nullable|string|max:5',
            'allergies' => 'nullable|string',
            'medecin_traitant' => 'nullable|string|max:100',
            'telephone_medecin' => 'nullable|string|max:20',
            
            // Transport
            'moyen_transport' => 'nullable|in:marche,bus,voiture,taxi,autre',
            'nom_transporteur' => 'nullable|string|max:100',
            'telephone_transporteur' => 'nullable|string|max:20',
            
            // Observations
            'observations' => 'nullable|string|max:500',
            
            // Sortie
            'date_sortie' => 'nullable|date',
            'motif_sortie' => 'nullable|string|max:500',
        ]);

        // Si changement de classe
        if ($validated['classe_id'] != $eleve->classe_id) {
            $ancienneClasse = $eleve->classe;
            $nouvelleClasse = Classe::find($validated['classe_id']);
            
            // Ajouter à l'historique
            $historique = $eleve->historique_classes ?? [];
            $historique[] = [
                'classe_id' => $eleve->classe_id,
                'classe_nom' => $ancienneClasse->nom_complet,
                'date_entree' => $eleve->date_inscription,
                'date_sortie' => now(),
            ];
            
            $validated['historique_classes'] = $historique;
            
            // Mettre à jour les compteurs
            $ancienneClasse->decrementerNombreEleves();
            $nouvelleClasse->incrementerNombreEleves();
        }

        // Si changement de statut
        if ($validated['statut'] != $eleve->statut) {
            if (in_array($validated['statut'], ['inactif', 'transfere', 'exclus']) && $eleve->statut === 'actif') {
                // Décrémenter le nombre d'élèves de la classe
                $eleve->classe->decrementerNombreEleves();
            } elseif ($validated['statut'] === 'actif' && in_array($eleve->statut, ['inactif', 'transfere', 'exclus'])) {
                // Incrémenter le nombre d'élèves de la classe
                $eleve->classe->incrementerNombreEleves();
            }
        }

        $validated['updated_by'] = auth()->id();
        
        $eleve->update($validated);
        
        // Log des changements
        $newData = $eleve->fresh()->toArray();
        $changes = [];
        foreach ($validated as $key => $value) {
            if ($oldData[$key] != $value) {
                $changes[$key] = [
                    'old' => $oldData[$key],
                    'new' => $value
                ];
            }
        }
        
        if (!empty($changes)) {
            $description = "Modification de l'élève par " . auth()->user()->name;
            $eleve->logAction('updated', $eleve, $oldData, $newData, $description);
        }

        return redirect()
            ->route('eleves.show', $eleve)
            ->with('success', "Élève {$eleve->nom_complet} mis à jour avec succès.");
    }

    public function destroy(Eleve $eleve)
    {
        if (!$eleve->can_be_deleted) {
            return back()->with('error', 'Impossible de supprimer cet élève car il a des notes ou des paiements associés.');
        }

        $nomEleve = $eleve->nom_complet;
        
        // Log avant suppression
        $eleve->logAction('deleted', $eleve, $eleve->toArray(), null,
            "Élève supprimé par " . auth()->user()->name
        );
        
        $eleve->delete();

        return redirect()
            ->route('eleves.index')
            ->with('success', "Élève {$nomEleve} supprimé avec succès.");
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:eleves,id',
            'action' => 'required|in:transferer_classe,changer_statut,exporter',
            'data' => 'required_if:action,transferer_classe,changer_statut',
        ]);

        $eleves = Eleve::whereIn('id', $request->ids);
        $currentUser = auth()->user();

        switch ($request->action) {
            case 'transferer_classe':
                $classe = Classe::findOrFail($request->data['classe_id']);
                
                $eleves->each(function ($eleve) use ($classe, $currentUser) {
                    $eleve->transfererVersClasse($classe);
                    $eleve->logAction('transferred', $eleve, null, null,
                        "Transfert vers {$classe->nom_complet} par {$currentUser->name}"
                    );
                });
                
                $message = 'Élèves transférés avec succès.';
                break;
                
            case 'changer_statut':
                $eleves->each(function ($eleve) use ($request, $currentUser) {
                    $ancienStatut = $eleve->statut;
                    $eleve->mettreAJourStatut(
                        $request->data['statut'],
                        $request->data['motif'] ?? null,
                        $request->data['date'] ?? null
                    );
                    $eleve->logAction('status_changed', $eleve,
                        ['statut' => $ancienStatut],
                        ['statut' => $request->data['statut']],
                        "Changement de statut par {$currentUser->name}"
                    );
                });
                
                $message = 'Statuts modifiés avec succès.';
                break;
        }

        return back()->with('success', $message);
    }

    public function export()
    {
        $eleves = Eleve::with('classe:id,nom_classe,niveau')
            ->orderBy('classe_id')
            ->orderBy('nom')
            ->get();
        
        $csv = \League\Csv\Writer::createFromString('');
        $csv->insertOne([
            'Matricule', 'Nom', 'Prénom', 'Date Naissance', 'Âge', 'Sexe',
            'Classe', 'Statut', 'Téléphone', 'Email', 'Père', 'Mère',
            'Date Inscription', 'Moyenne'
        ]);
        
        foreach ($eleves as $eleve) {
            $csv->insertOne([
                $eleve->matricule,
                $eleve->nom,
                $eleve->prenom,
                $eleve->date_naissance->format('d/m/Y'),
                $eleve->age,
                $eleve->sexe_label,
                $eleve->classe->nom_complet,
                $eleve->statut_label,
                $eleve->telephone,
                $eleve->email,
                $eleve->nom_pere,
                $eleve->nom_mere,
                $eleve->date_inscription->format('d/m/Y'),
                $eleve->moyenne_generale ?? 'N/A',
            ]);
        }
        
        return response((string) $csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="eleves-' . date('Y-m-d') . '.csv"',
        ]);
    }

    public function genererBulletin(Eleve $eleve)
    {
        $eleve->load([
            'classe',
            'notes.matiere',
            'notes.evaluation',
        ]);
        
        // Calcul des moyennes par matière
        $matieres = [];
        foreach ($eleve->notes as $note) {
            $matiereId = $note->matiere->id;
            
            if (!isset($matieres[$matiereId])) {
                $matieres[$matiereId] = [
                    'matiere' => $note->matiere->nom,
                    'coefficient' => $note->matiere->coefficient,
                    'notes' => [],
                    'moyenne' => 0,
                ];
            }
            
            $matieres[$matiereId]['notes'][] = [
                'valeur' => $note->valeur,
                'type' => $note->type,
                'date' => $note->date_evaluation,
            ];
        }
        
        // Calcul de la moyenne par matière
        foreach ($matieres as $matiereId => &$matiere) {
            if (!empty($matiere['notes'])) {
                $somme = array_sum(array_column($matiere['notes'], 'valeur'));
                $matiere['moyenne'] = round($somme / count($matiere['notes']), 2);
            }
        }
        
        $data = [
            'eleve' => $eleve,
            'matieres' => $matieres,
            'moyenne_generale' => $eleve->calculerMoyenne(),
            'date_edition' => now()->format('d/m/Y'),
        ];
        
        return Inertia::render('Eleves/Bulletin', $data);
    }
}