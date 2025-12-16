<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Budget;
use App\Models\Depense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $query = Budget::query()
            ->orderBy('annee', 'desc')
            ->orderByRaw("FIELD(mois, 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre')");

        if ($request->filled('annee')) {
            $query->where('annee', $request->annee);
        }

        if ($request->filled('mois')) {
            $query->where('mois', $request->mois);
        }

        if ($request->filled('est_actif') && $request->est_actif !== 'all') {
            $query->where('est_actif', $request->est_actif === 'true');
        }

        $budgets = $query->paginate($request->input('per_page', 15))
        ->withQueryString()
        ->through(function ($budget) {
            // Add calculated fields to each budget
            $budget->pourcentage_utilise = $budget->montant_alloue > 0 
                ? ($budget->montant_depense / $budget->montant_alloue) * 100 
                : 0;
            $budget->est_depasse = $budget->montant_depense > $budget->montant_alloue;
            $budget->nom_complet = ucfirst($budget->mois) . ' ' . $budget->annee;
            return $budget;
        });
    

        $stats = [
            'total' => Budget::count(),
            'total_alloue' => Budget::sum('montant_alloue'),
            'total_depense' => Budget::sum('montant_depense'),
            'total_restant' => Budget::sum(DB::raw('montant_alloue - montant_depense')),
            'budget_courant' => Budget::actif()->pourMoisEnCours()->first(),
        ];

    // Also update the budget_courant
    if ($stats['budget_courant']) {
        $stats['budget_courant']->pourcentage_utilise = $stats['budget_courant']->montant_alloue > 0 
            ? ($stats['budget_courant']->montant_depense / $stats['budget_courant']->montant_alloue) * 100 
            : 0;
        $stats['budget_courant']->est_depasse = $stats['budget_courant']->montant_depense > $stats['budget_courant']->montant_alloue;
        $stats['budget_courant']->nom_complet = ucfirst($stats['budget_courant']->mois) . ' ' . $stats['budget_courant']->annee;
    }
    

        $annees = Budget::distinct('annee')->pluck('annee');
        $mois = [
            'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
            'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
        ];

        return Inertia::render('Budgets/Index', [
            'budgets' => $budgets,
            'filters' => $request->only(['annee', 'mois', 'est_actif', 'per_page']),
            'stats' => $stats,
            'annees' => $annees,
            'mois' => $mois,
        ]);
    }

    public function create()
    {
        return Inertia::render('Budgets/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'annee' => 'required|string|size:4',
            'mois' => [
                'required',
                'string',
                Rule::in([
                    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
                ]),
            ],
            'montant_alloue' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'est_actif' => 'boolean',
        ]);

        // Vérifier l'unicité du budget pour ce mois/année
        $exists = Budget::where('annee', $validated['annee'])
            ->where('mois', $validated['mois'])
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'mois' => 'Un budget existe déjà pour ' . $validated['mois'] . ' ' . $validated['annee']
            ]);
        }

        Budget::create($validated);

        return redirect()->route('budgets.index')
            ->with('success', 'Budget créé avec succès.');
    }

    public function show(Budget $budget)
    {
        // Charger les dépenses liées à ce budget
        $depenses = Depense::where('budget_id', $budget->id)
            ->with(['user', 'categorieDepense'])
            ->get();

        // Calculer les statistiques par catégorie
        $parCategorie = Depense::where('budget_id', $budget->id)
            ->select([
                'categorie_depense_id',
                DB::raw('categories_depenses.nom_categorie as categorie'),
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(montant) as montant')
            ])
            ->leftJoin('categories_depenses', 'depenses.categorie_depense_id', '=', 'categories_depenses.id')
            ->groupBy('categorie_depense_id', 'categories_depenses.nom_categorie')
            ->get()
            ->map(function ($item) use ($budget) {
                $item->pourcentage = $budget->montant_depense > 0 
                    ? ($item->montant / $budget->montant_depense) * 100 
                    : 0;
                return $item;
            });

        // Calculer les statistiques par statut
        $parStatut = Depense::where('budget_id', $budget->id)
            ->select([
                'statut',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(montant) as montant')
            ])
            ->groupBy('statut')
            ->get();

        // Dépenses récentes (5 dernières)
        $recentes = Depense::where('budget_id', $budget->id)
            ->with(['user', 'categorieDepense'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('Budgets/Show', [
            'budget' => $budget,
            'depenses' => [
                'data' => $depenses,
                'total' => $depenses->count(),
                'par_categorie' => $parCategorie,
                'par_statut' => $parStatut,
                'recentes' => $recentes,
            ],
            'flash' => session('flash', [])
        ]);
    }

    public function edit(Budget $budget)
    {
        return Inertia::render('Budgets/Edit', [
            'budget' => $budget,
        ]);
    }

    public function update(Request $request, Budget $budget)
    {
        $validated = $request->validate([
            'annee' => 'required|string|size:4',
            'mois' => [
                'required',
                'string',
                Rule::in([
                    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
                ]),
            ],
            'montant_alloue' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'est_actif' => 'boolean',
        ]);

        // Vérifier l'unicité du budget pour ce mois/année (sauf celui en cours)
        $exists = Budget::where('annee', $validated['annee'])
            ->where('mois', $validated['mois'])
            ->where('id', '!=', $budget->id)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'mois' => 'Un budget existe déjà pour ' . $validated['mois'] . ' ' . $validated['annee']
            ]);
        }

        // Vérifier si on ne réduit pas le budget en dessous des dépenses déjà faites
        if ($validated['montant_alloue'] < $budget->montant_depense) {
            return back()->withErrors([
                'montant_alloue' => 'Le montant alloué ne peut pas être inférieur au montant déjà dépensé (' . number_format($budget->montant_depense, 2) . ')'
            ]);
        }

        $budget->update($validated);

        return redirect()->route('budgets.index')
            ->with('success', 'Budget mis à jour avec succès.');
    }

    public function destroy(Budget $budget)
    {
        // Vérifier si le budget a des dépenses
        if ($budget->depenses()->exists()) {
            return back()->withErrors([
                'error' => 'Impossible de supprimer ce budget car il contient des dépenses.'
            ]);
        }

        $budget->delete();

        return redirect()->route('budgets.index')
            ->with('success', 'Budget supprimé avec succès.');
    }

    public function dupliquer(Budget $budget, Request $request)
    {
        $request->validate([
            'nouveau_mois' => 'required|string',
            'nouvelle_annee' => 'required|string|size:4',
        ]);

        // Vérifier si le budget de destination existe déjà
        $exists = Budget::where('annee', $request->nouvelle_annee)
            ->where('mois', $request->nouveau_mois)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'error' => 'Un budget existe déjà pour ' . $request->nouveau_mois . ' ' . $request->nouvelle_annee
            ]);
        }

        // Créer le nouveau budget
        $nouveauBudget = $budget->replicate();
        $nouveauBudget->annee = $request->nouvelle_annee;
        $nouveauBudget->mois = $request->nouveau_mois;
        $nouveauBudget->montant_depense = 0;
        $nouveauBudget->save();

        return redirect()->route('budgets.index')
            ->with('success', 'Budget dupliqué avec succès.');
    }
}