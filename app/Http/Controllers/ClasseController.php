<?php

namespace App\Http\Controllers;

use App\Models\Classe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ClasseController extends Controller
{
    // Liste des classes
    public function index(Request $request)
    {
        $search = $request->input('search');
        $niveau = $request->input('niveau');
        $section = $request->input('section');
        $statut = $request->input('statut');
        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'nom_classe');
        $sortDirection = $request->input('sort_direction', 'asc');

        $classes = Classe::query()
            ->with(['professeurPrincipal:id,name,email'])
            ->when($search, fn($q) => $q->search($search))
            ->when($niveau, fn($q) => $q->byNiveau($niveau))
            ->when($section, fn($q) => $q->bySection($section))
            ->when($statut, fn($q) => $q->where('statut', $statut))
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        // Statistiques
        $stats = [
            'total' => Classe::count(),
            'primaire' => Classe::primaire()->count(),
            'secondaire' => Classe::secondaire()->count(),
            'active' => Classe::active()->count(),
            'total_eleves' => Classe::sum('nombre_eleves'),
        ];

        // Professeurs disponibles (pour les filtres)
        $professeurs = User::select('id', 'name')->get();
        return Inertia::render('Classes/Index', [
            'classes' => $classes,
            'filters' => [
                'search' => $search,
                'niveau' => $niveau,
                'section' => $section,
                'statut' => $statut,
                'per_page' => $perPage,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'stats' => $stats,
            'professeurs' => $professeurs,
            'sections' => Classe::getSectionsSecondaire(),
        ]);
    }

    // Formulaire de création
    public function create()
    {
        $professeurs = User::select('id', 'name', 'email')->get();

        return Inertia::render('Classes/Create', [
            'professeurs' => $professeurs,
            'sections' => Classe::getSectionsSecondaire(),
        ]);
    }

    // Stocker une nouvelle classe
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom_classe' => 'required|string|max:100',
            'niveau' => 'required|in:primaire,secondaire',
            'section' => [
                'nullable',
                'string',
                Rule::requiredIf(fn() => $request->niveau === 'secondaire'),
                Rule::in(array_keys(Classe::getSectionsSecondaire())),
            ],
            'professeur_principal_id' => 'nullable|exists:users,id',
            'capacite_max' => 'required|integer|min:1|max:100',
            'description' => 'nullable|string|max:500',
        ]);

        // Générer le nom complet
        $nomComplet = $validated['nom_classe'];
        if ($validated['niveau'] === 'secondaire' && isset($validated['section'])) {
            $nomComplet .= ' ' . $validated['section'];
        }

        // Vérifier l'unicité
        $exists = Classe::where('nom_classe', $validated['nom_classe'])
            ->where('niveau', $validated['niveau'])
            ->when($validated['niveau'] === 'secondaire', fn($q) => $q->where('section', $validated['section']))
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'nom_classe' => 'Une classe avec ce nom et cette section existe déjà.',
            ]);
        }

        $classe = Classe::create([
            'nom_classe' => $validated['nom_classe'],
            'niveau' => $validated['niveau'],
            'section' => $validated['section'] ?? null,
            'professeur_principal_id' => $validated['professeur_principal_id'] ?? null,
            'capacite_max' => $validated['capacite_max'],
            'description' => $validated['description'],
            'statut' => 'active',
        ]);

        return redirect()
            ->route('classes.index')
            ->with('success', "Classe {$classe->nom_complet} créée avec succès.");
    }

    // Afficher une classe
    public function show(Classe $classe)
    {
        $classe->load([
            'professeurPrincipal:id,name,email,avatar',
            'eleves' => function ($q) {
                $q->select('id', 'nom', 'prenom', 'date_naissance', 'classe_id')
                  ->orderBy('nom')
                  ->limit(20);
            },
            'logs' => function ($q) {
                $q->with('user:id,name')
                  ->latest()
                  ->limit(10);
            },
        ]);

        // Statistiques de la classe
        $stats = [
            'eleves_total' => $classe->eleves()->count(),
            'eleves_garcons' => $classe->eleves()->where('sexe', 'M')->count(),
            'eleves_filles' => $classe->eleves()->where('sexe', 'F')->count(),
            'cours_total' => $classe->cours()->count(),
            'moyenne_generale' => $classe->eleves()->avg('moyenne_generale'),
        ];

        return Inertia::render('Classes/Show', [
            'classe' => $classe,
            'stats' => $stats,
        ]);
    }

    // Formulaire d'édition
    public function edit(string $classe)
    {
        $classe = Classe::findOrFail($classe);
        $professeurs = User::select('id', 'name', 'email')->get();

        return Inertia::render('Classes/Edit', [
            'classe' => $classe,
            'professeurs' => $professeurs,
            'sections' => Classe::getSectionsSecondaire(),
        ]);
    }

    // Mettre à jour une classe
    public function update(Request $request, Classe $classe)
    {
        $oldData = $classe->toArray();
        
        $validated = $request->validate([
            'nom_classe' => 'required|string|max:100',
            'niveau' => 'required|in:primaire,secondaire',
            'section' => [
                'nullable',
                'string',
                Rule::requiredIf(fn() => $request->niveau === 'secondaire'),
                Rule::in(array_keys(Classe::getSectionsSecondaire())),
            ],
            'professeur_principal_id' => 'nullable|exists:users,id',
            'capacite_max' => 'required|integer|min:1|max:100',
            'statut' => 'required|in:active,inactive,archived',
            'description' => 'nullable|string|max:500',
        ]);

        // Vérifier l'unicité (exclure la classe actuelle)
        $exists = Classe::where('nom_classe', $validated['nom_classe'])
            ->where('niveau', $validated['niveau'])
            ->when($validated['niveau'] === 'secondaire', fn($q) => $q->where('section', $validated['section']))
            ->where('id', '!=', $classe->id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'nom_classe' => 'Une autre classe avec ce nom et cette section existe déjà.',
            ]);
        }

        // Vérifier si on peut changer le statut
        if ($validated['statut'] === 'archived' && $classe->nombre_eleves > 0) {
            return back()->withErrors([
                'statut' => 'Impossible d\'archiver une classe contenant des élèves.',
            ]);
        }

        $classe->update($validated);
        
        // Log des changements
        $newData = $classe->fresh()->toArray();
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
            $description = "Modification de la classe par " . Auth::user()->name;
            $classe->logAction('updated', $classe, $oldData, $newData, $description);
        }

        return redirect()
            ->route('classes.index')
            ->with('success', "Classe {$classe->nom_complet} mise à jour avec succès.");
    }

    // Supprimer une classe
    public function destroy(Classe $classe)
    {
        if ($classe->nombre_eleves > 0) {
            return back()->with('error', 'Impossible de supprimer une classe contenant des élèves.');
        }

        $nomClasse = $classe->nom_complet;
        
        // Log avant suppression
        $classe->logAction('deleted', $classe, $classe->toArray(), null,
            "Classe supprimée par " . Auth::user()->name
        );
        
        $classe->delete();

        return redirect()
            ->route('classes.index')
            ->with('success', "Classe {$nomClasse} supprimée avec succès.");
    }

    // Actions en masse
    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:classes,id',
            'action' => 'required|in:activate,deactivate,archive,delete',
        ]);

        $classes = Classe::whereIn('id', $request->ids);
        $currentUser = Auth::user();

        switch ($request->action) {
            case 'activate':
                $classes->update(['statut' => 'active']);
                $message = 'Classes activées avec succès.';
                break;
                
            case 'deactivate':
                $classes->where('nombre_eleves', 0)->update(['statut' => 'inactive']);
                $message = 'Classes sans élèves désactivées avec succès.';
                break;
                
            case 'archive':
                $classes->where('nombre_eleves', 0)->update(['statut' => 'archived']);
                $message = 'Classes sans élèves archivées avec succès.';
                break;
                
            case 'delete':
                $classes->where('nombre_eleves', 0)->each(function ($classe) use ($currentUser) {
                    $classe->logAction('deleted', $classe, $classe->toArray(), null,
                        "Suppression en masse par {$currentUser->name}"
                    );
                    $classe->delete();
                });
                $message = 'Classes sans élèves supprimées avec succès.';
                break;
        }

        return back()->with('success', $message);
    }

    // Exporter les classes
    public function export(Request $request)
    {
        $classes = Classe::with('professeurPrincipal:id,name')
            ->orderBy('niveau')
            ->orderBy('nom_classe')
            ->get();
        
        $csv = \League\Csv\Writer::createFromString('');
        $csv->insertOne([
            'ID', 'Nom', 'Niveau', 'Section', 'Référence', 
            'Professeur Principal', 'Capacité', 'Élèves', 
            'Occupation %', 'Statut', 'Date création'
        ]);
        
        foreach ($classes as $classe) {
            $csv->insertOne([
                $classe->id,
                $classe->nom_complet,
                $classe->niveau_label,
                $classe->section ?? '-',
                $classe->ref,
                $classe->professeurPrincipal?->name ?? '-',
                $classe->capacite_max,
                $classe->nombre_eleves,
                $classe->pourcentage_occupation . '%',
                $classe->statut_label,
                $classe->created_at->format('d/m/Y'),
            ]);
        }
        
        return response((string) $csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="classes-' . date('Y-m-d') . '.csv"',
        ]);
    }

    // Générer un rapport PDF
    public function rapport(Classe $classe)
    {
        $classe->load([
            'professeurPrincipal:id,name,email',
            'eleves' => function ($q) {
                $q->orderBy('nom')->orderBy('prenom');
            },
        ]);

        $data = [
            'classe' => $classe,
            'date' => now()->format('d/m/Y'),
            'stats' => [
                'total_eleves' => $classe->eleves->count(),
                'garcons' => $classe->eleves->where('sexe', 'M')->count(),
                'filles' => $classe->eleves->where('sexe', 'F')->count(),
                'moyenne_classe' => $classe->eleves->avg('moyenne_generale'),
            ],
        ];

        // Vous pouvez utiliser DomPDF ou autre package pour générer le PDF
        // return PDF::loadView('pdf.classe-rapport', $data)->download("classe-{$classe->ref}.pdf");
        
        return Inertia::render('Classes/Rapport', $data);
    }
}