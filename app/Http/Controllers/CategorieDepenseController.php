<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\CategorieDepense;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategorieDepenseController extends Controller
{
    public function index(Request $request)
    {
        $query = CategorieDepense::query()
            ->orderBy('nom_categorie');

        if ($request->filled('search')) {
            $query->where('nom_categorie', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
        }

        $categories = $query->paginate($request->input('per_page', 15))
            ->withQueryString();

        return Inertia::render('CategoriesDepense/Index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }
 public function create()
    {
        return Inertia::render('CategoriesDepense/Form');
    }
   public function store(Request $request)
    {
        $request->validate([
            'nom_categorie' => 'required|string|max:255|unique:categories_depenses,nom_categorie',
            'code' => 'required|string|max:50|unique:categories_depenses,code',
            'description' => 'nullable|string',
            'est_actif' => 'boolean',
        ]);

        $categorie = CategorieDepense::create([
            'nom_categorie' => $request->nom_categorie,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'est_actif' => $request->est_actif ?? true,
            'ref' => Str::uuid(),
        ]);

        return redirect()
            ->route('categories-depense.show', $categorie)
            ->with('flash', ['success' => 'Catégorie créée avec succès']);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $categorieDepense)
    {
        $categorieDepense = CategorieDepense::withTrashed()->findOrFail($categorieDepense);
        $stats = [
            'total_depenses' => $categorieDepense->depenses()->count(),
            'montant_total' => $categorieDepense->depenses()->sum('montant'),
            'derniere_depense' => $categorieDepense->depenses()
                ->latest()
                ->first()
                ?->created_at,
        ];

        return Inertia::render('CategoriesDepense/Show', [
            'categorie' => $categorieDepense,
            'stats' => $stats,
            'flash' => session()->get('flash', []),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CategorieDepense $categorieDepense)
    {
        return Inertia::render('CategoriesDepense/Form', [
            'categorie' => $categorieDepense,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CategorieDepense $categorieDepense)
    {
        $request->validate([
            'nom_categorie' => 'required|string|max:255|unique:categories_depenses,nom_categorie,' . $categorieDepense->id,
            'code' => 'required|string|max:50|unique:categories_depenses,code,' . $categorieDepense->id,
            'description' => 'nullable|string',
            'est_actif' => 'boolean',
        ]);

        $categorieDepense->update([
            'nom_categorie' => $request->nom_categorie,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'est_actif' => $request->est_actif ?? true,
        ]);

        return redirect()
            ->route('categories-depense.show', $categorieDepense)
            ->with('flash', ['success' => 'Catégorie modifiée avec succès']);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CategorieDepense $categorieDepense)
    {
        $categorieDepense->delete();

        return redirect()
            ->route('categories-depense.index')
            ->with('flash', ['success' => 'Catégorie supprimée avec succès']);
    }

    /**
     * Restore the specified resource.
     */
    public function restore($id)
    {
        $categorie = CategorieDepense::withTrashed()->findOrFail($id);
        $categorie->restore();

        return redirect()
            ->route('categories-depense.show', $categorie)
            ->with('flash', ['success' => 'Catégorie restaurée avec succès']);
    }

    /**
     * Force delete the specified resource.
     */
    public function forceDelete($id)
    {
        $categorie = CategorieDepense::withTrashed()->findOrFail($id);
        $categorie->forceDelete();

        return redirect()
            ->route('categories-depense.index')
            ->with('flash', ['success' => 'Catégorie définitivement supprimée']);
    }
}