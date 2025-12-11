<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Depense;
use App\Models\Budget;
use App\Models\CategorieDepense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DepenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Depense::query()
            ->with(['budget', 'categorie', 'user'])
            ->orderBy($request->input('sort_by', 'created_at'), $request->input('sort_direction', 'desc'));

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('reference', 'like', '%' . $request->search . '%')
                  ->orWhere('libelle', 'like', '%' . $request->search . '%')
                  ->orWhere('beneficiaire', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('budget_id')) {
            $query->where('budget_id', $request->budget_id);
        }

        if ($request->filled('categorie_id')) {
            $query->where('categorie_depense_id', $request->categorie_id);
        }

        if ($request->filled('statut') && $request->statut !== 'all') {
            $query->where('statut', $request->statut);
        }

        if ($request->filled('date_debut')) {
            $query->where('date_depense', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->where('date_depense', '<=', $request->date_fin);
        }

        $depenses = $query->paginate($request->input('per_page', 15))
            ->withQueryString();

        $stats = $this->getStats($request);

        $budgets = Budget::actif()
            ->orderBy('annee', 'desc')
            ->orderByRaw("FIELD(mois, 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre')")
            ->get();

        $categories = CategorieDepense::actif()
            ->orderBy('nom_categorie')
            ->get();

        return Inertia::render('Depenses/Index', [
            'depenses' => $depenses,
            'filters' => $request->only(['search', 'budget_id', 'categorie_id', 'statut', 'date_debut', 'date_fin', 'per_page', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'budgets' => $budgets,
            'categories' => $categories,
        ]);
    }

    private function getStats(Request $request)
    {
        $query = Depense::query();

        if ($request->filled('budget_id')) {
            $query->where('budget_id', $request->budget_id);
        }

        if ($request->filled('date_debut')) {
            $query->where('date_depense', '>=', $request->date_debut);
        }

        if ($request->filled('date_fin')) {
            $query->where('date_depense', '<=', $request->date_fin);
        }

        $total = $query->count();
        $montant_total = $query->sum('montant');

        $par_statut = $query->clone()
            ->select('statut', DB::raw('COUNT(*) as count'), DB::raw('SUM(montant) as total'))
            ->groupBy('statut')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->statut => [
                    'count' => $item->count,
                    'total' => $item->total
                ]];
            });

        $par_categorie = $query->clone()
            ->join('categories_depenses', 'depenses.categorie_depense_id', '=', 'categories_depenses.id')
            ->select('categories_depenses.nom_categorie', DB::raw('COUNT(*) as count'), DB::raw('SUM(montant) as total'))
            ->groupBy('categories_depenses.nom_categorie')
            ->get()
            ->mapWithKeys(function ($item) {
                return [$item->nom_categorie => [
                    'count' => $item->count,
                    'total' => $item->total
                ]];
            });

        return [
            'total' => $total,
            'montant_total' => $montant_total,
            'par_statut' => $par_statut,
            'par_categorie' => $par_categorie,
            'aujourdhui' => [
                'count' => Depense::whereDate('date_depense', today())->count(),
                'total' => Depense::whereDate('date_depense', today())->sum('montant')
            ],
            'ce_mois' => [
                'count' => Depense::whereMonth('date_depense', now()->month)
                    ->whereYear('date_depense', now()->year)
                    ->count(),
                'total' => Depense::whereMonth('date_depense', now()->month)
                    ->whereYear('date_depense', now()->year)
                    ->sum('montant')
            ]
        ];
    }

    public function create()
    {
        $budgets = Budget::actif()
            ->orderBy('annee', 'desc')
            ->orderByRaw("FIELD(mois, 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre')")
            ->get();

        $categories = CategorieDepense::actif()
            ->orderBy('nom_categorie')
            ->get();
        $budget_courant = Budget::actif()->pourMoisEnCours()->first();

        return Inertia::render('Depenses/Create', [
            'budgets' => $budgets,
            'categories' => $categories,
            'budget_courant' => $budget_courant,
            'reference' => 'DEP-' . strtoupper(\Illuminate\Support\Str::random(10)),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'budget_id' => 'required|exists:budgets,id',
            'categorie_depense_id' => 'required|exists:categories_depenses,id',
            'reference' => 'required|string|max:255|unique:depenses,reference',
            'libelle' => 'required|string|max:255',
            'montant' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:espèce,chèque,virement,carte',
            'beneficiaire' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_depense' => 'required|date',
            'numero_piece' => 'nullable|string|max:255',
            'fichier_joint' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'statut' => 'required|in:brouillon,en_attente,approuve,rejete,paye',
        ]);

        DB::beginTransaction();

        try {
            // Vérifier si le budget a suffisamment de fonds restants
            $budget = Budget::find($validated['budget_id']);
            $montant_restant = $budget->montant_alloue - $budget->montant_depense;
            
            if ($montant_restant < $validated['montant'] && $validated['statut'] === 'paye') {
                return back()->withErrors([
                    'montant' => 'Le budget ne dispose que de ' . number_format($montant_restant, 2) . ' restants. Montant insuffisant.'
                ]);
            }

            // Gérer le fichier joint
            if ($request->hasFile('fichier_joint')) {
                $path = $request->file('fichier_joint')->store('depenses', 'public');
                $validated['fichier_joint'] = $path;
            }

            $depense = Depense::create(array_merge($validated, [
                'user_id' => auth()->id(),
            ]));

            

            DB::commit();

            return redirect()->route('depenses.show', $depense->id)
                ->with('success', 'Dépense créée avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la création de la dépense.']);
        }
    }

    public function show(Depense $depense)
    {
        $depense->load(['budget', 'categorie', 'user', 'approbations.user']);

        return Inertia::render('Depenses/Show', [
            'depense' => $depense,
        ]);
    }

    public function edit(Depense $depense)
    {
        if (!$depense->peutEtreModifiee()) {
            return back()->withErrors(['error' => 'Cette dépense ne peut plus être modifiée.']);
        }

        $depense->load(['budget', 'categorie']);

        $budgets = Budget::actif()
            ->orderBy('annee', 'desc')
            ->orderByRaw("FIELD(mois, 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre')")
            ->get();

        $categories = CategorieDepense::actif()
            ->orderBy('nom_categorie')
            ->get();

        return Inertia::render('Depenses/Edit', [
            'depense' => $depense,
            'budgets' => $budgets,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Depense $depense)
    {
        if (!$depense->peutEtreModifiee()) {
            return back()->withErrors(['error' => 'Cette dépense ne peut plus être modifiée.']);
        }

        $validated = $request->validate([
            'budget_id' => 'required|exists:budgets,id',
            'categorie_depense_id' => 'required|exists:categories_depenses,id',
            'reference' => 'required|string|max:255|unique:depenses,reference,' . $depense->id,
            'libelle' => 'required|string|max:255',
            'montant' => 'required|numeric|min:0',
            'mode_paiement' => 'required|in:espèce,chèque,virement,carte',
            'beneficiaire' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_depense' => 'required|date',
            'numero_piece' => 'nullable|string|max:255',
            'fichier_joint' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'statut' => 'required|in:brouillon,en_attente,approuve,rejete,paye',
        ]);

        DB::beginTransaction();

        try {
            $ancienBudget = $depense->budget;
            $nouveauBudget = Budget::find($validated['budget_id']);
            $ancienStatut = $depense->statut;
            $nouveauStatut = $validated['statut'];

            // Gérer le fichier joint
            if ($request->hasFile('fichier_joint')) {
                // Supprimer l'ancien fichier s'il existe
                if ($depense->fichier_joint) {
                    Storage::disk('public')->delete($depense->fichier_joint);
                }
                $path = $request->file('fichier_joint')->store('depenses', 'public');
                $validated['fichier_joint'] = $path;
            } else {
                // Conserver l'ancien fichier
                $validated['fichier_joint'] = $depense->fichier_joint;
            }

            // Mettre à jour la dépense
            $depense->update($validated);

            // Gérer les ajustements budgétaires
            if ($ancienStatut === 'paye' && $nouveauStatut !== 'paye') {
                // La dépense n'est plus payée, retirer du budget
                $ancienBudget->montant_depense -= $depense->montant;
                $ancienBudget->save();
            } elseif ($ancienStatut !== 'paye' && $nouveauStatut === 'paye') {
                // La dépense devient payée, ajouter au budget
                $nouveauBudget->montant_depense += $depense->montant;
                $nouveauBudget->save();
            } elseif ($ancienStatut === 'paye' && $nouveauStatut === 'paye') {
                // La dépense reste payée, vérifier si le budget a changé
                if ($ancienBudget->id !== $nouveauBudget->id) {
                    // Retirer de l'ancien budget, ajouter au nouveau
                    $ancienBudget->montant_depense -= $depense->montant;
                    $ancienBudget->save();
                    
                    $nouveauBudget->montant_depense += $depense->montant;
                    $nouveauBudget->save();
                } elseif ($depense->montant != $validated['montant']) {
                    // Le montant a changé, ajuster le budget
                    $difference = $validated['montant'] - $depense->montant;
                    $nouveauBudget->montant_depense += $difference;
                    $nouveauBudget->save();
                }
            }

            DB::commit();

            return redirect()->route('depenses.show', $depense->id)
                ->with('success', 'Dépense mise à jour avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la mise à jour de la dépense: ' . $e->getMessage()]);
        }
    }

    public function destroy(Depense $depense)
    {
        if (!$depense->peutEtreSupprimee()) {
            return back()->withErrors(['error' => 'Cette dépense ne peut plus être supprimée.']);
        }

        DB::beginTransaction();

        try {
            // Retirer du budget si la dépense était payée
            if ($depense->statut === 'paye' && $depense->budget) {
                $depense->budget->montant_depense -= $depense->montant;
                $depense->budget->save();
            }

            // Supprimer le fichier joint
            if ($depense->fichier_joint) {
                Storage::disk('public')->delete($depense->fichier_joint);
            }

            $depense->delete();

            DB::commit();

            return redirect()->route('depenses.index')
                ->with('success', 'Dépense supprimée avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Une erreur est survenue lors de la suppression de la dépense.']);
        }
    }

    public function approuver(Request $request, Depense $depense)
    {
        $request->validate([
            'decision' => 'required|in:approuve,rejete',
            'commentaire' => 'nullable|string',
        ]);

        DB::beginTransaction();

        try {
            // Enregistrer l'approbation
            $depense->approbations()->create([
                'user_id' => auth()->id(),
                'decision' => $request->decision,
                'commentaire' => $request->commentaire,
            ]);

            // Mettre à jour le statut de la dépense
            $depense->update(['statut' => $request->decision]);

            // Si approuvé et que le statut devient "paye", mettre à jour le budget
            if ($request->decision === 'approuve' && $depense->statut === 'paye') {
                $depense->budget->montant_depense += $depense->montant;
                $depense->budget->save();
            }

            DB::commit();

            return redirect()->route('depenses.show', $depense)
                ->with('success', 'Dépense ' . ($request->decision === 'approuve' ? 'approuvée' : 'rejetée') . ' avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Une erreur est survenue lors de l\'approbation.']);
        }
    }

    public function marquerCommePaye(Depense $depense)
    {
        DB::beginTransaction();

        try {
            // Vérifier si le budget a suffisamment de fonds
            $budget = $depense->budget;
            $montant_restant = $budget->montant_alloue - $budget->montant_depense;
            
            if ($montant_restant < $depense->montant) {
                return back()->withErrors([
                    'error' => 'Le budget ne dispose que de ' . number_format($montant_restant, 2) . ' restants. Montant insuffisant.'
                ]);
            }

            // Mettre à jour le statut
            $depense->update(['statut' => 'paye']);

            // Mettre à jour le budget
            $budget->montant_depense += $depense->montant;
            $budget->save();

            DB::commit();

            return redirect()->route('depenses.show', $depense)
                ->with('success', 'Dépense marquée comme payée avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Une erreur est survenue.']);
        }
    }
}