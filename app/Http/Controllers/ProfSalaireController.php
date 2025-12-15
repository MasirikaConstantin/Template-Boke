<?php

namespace App\Http\Controllers;

use App\Models\ProfSalaire;
use App\Models\Professeur;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ProfSalaireController extends Controller
{
    public function index(Request $request)
    {
        $query = ProfSalaire::with('professeur')
            ->active()
            ->when($request->search, function ($q, $search) {
                $q->whereHas('professeur', function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('ref', 'like', "%{$search}%");
            })
            ->when($request->type_salaire && $request->type_salaire !== 'all', function ($q, $type) {
                $q->where('type_salaire', $type);
            })
            ->when($request->professeur_id && $request->professeur_id !== 'all', function ($q, $professeurId) {
                $q->where('professeur_id', $professeurId);
            });

        // Gestion du tri
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        if (in_array($sortBy, ['professeur.nom', 'montant'])) {
            if ($sortBy === 'professeur.nom') {
                $query->join('professeurs', 'prof_salaires.professeur_id', '=', 'professeurs.id')
                      ->orderBy('professeurs.nom', $sortDirection);
            } elseif ($sortBy === 'montant') {
                $query->orderBy(
                    DB::raw('CASE WHEN type_salaire = "horaire" THEN taux_horaire ELSE salaire_fixe END'),
                    $sortDirection
                );
            }
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }

        $profSalaires = $query->paginate($request->input('per_page', 10));

        $stats = [
            'total' => ProfSalaire::active()->count(),
            'horaire' => ProfSalaire::active()->where('type_salaire', 'horaire')->count(),
            'mensuel' => ProfSalaire::active()->where('type_salaire', 'mensuel')->count(),
            'total_montant' => ProfSalaire::active()->sum(DB::raw('CASE WHEN type_salaire = "horaire" THEN taux_horaire ELSE salaire_fixe END')),
        ];

        $professeurs = Professeur::active()->get(['id', 'nom', 'email']);

        return Inertia::render('ProfSalaires/Index', [
            'profSalaires' => $profSalaires,
            'filters' => $request->only(['search', 'type_salaire', 'professeur_id', 'per_page', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'professeurs' => $professeurs,
            'flash' => session('flash', [])
        ]);
    }

    public function create()
    {
        $professeurs = Professeur::active()->get(['id', 'nom', 'email']);
        
        return Inertia::render('ProfSalaires/Create', [
            'professeurs' => $professeurs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'type_salaire' => 'required|in:horaire,mensuel',
            'taux_horaire' => 'required_if:type_salaire,horaire|nullable|numeric|min:0|max:1000',
            'salaire_fixe' => 'required_if:type_salaire,mensuel|nullable|numeric|min:0|max:100000',
        ]);

        // Vérifier si le professeur a déjà un salaire actif
        $existingSalaire = ProfSalaire::where('professeur_id', $validated['professeur_id'])
            ->active()
            ->first();

        if ($existingSalaire) {
            return redirect()->back()->withErrors([
                'professeur_id' => 'Ce professeur a déjà un salaire actif.'
            ]);
        }

        ProfSalaire::create($validated);

        return redirect()->route('prof-salaires.index')
            ->with('flash', [
                'success' => 'Configuration de salaire créée avec succès.'
            ]);
    }

    public function show(ProfSalaire $profSalaire)
    {
        $profSalaire->load('professeur');

        return Inertia::render('ProfSalaires/Show', [
            'profSalaire' => $profSalaire,
        ]);
    }

    public function edit(ProfSalaire $profSalaire)
    {
        $professeurs = Professeur::active()->get(['id', 'nom', 'email']);

        return Inertia::render('ProfSalaires/Edit', [
            'profSalaire' => $profSalaire,
            'professeurs' => $professeurs,
        ]);
    }

    public function update(Request $request, ProfSalaire $profSalaire)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'type_salaire' => 'required|in:horaire,mensuel',
            'taux_horaire' => 'required_if:type_salaire,horaire|nullable|numeric|min:0|max:1000',
            'salaire_fixe' => 'required_if:type_salaire,mensuel|nullable|numeric|min:0|max:100000',
        ]);

        // Vérifier si un autre professeur a déjà ce salaire
        if ($profSalaire->professeur_id != $validated['professeur_id']) {
            $existingSalaire = ProfSalaire::where('professeur_id', $validated['professeur_id'])
                ->where('id', '!=', $profSalaire->id)
                ->active()
                ->first();

            if ($existingSalaire) {
                return redirect()->back()->withErrors([
                    'professeur_id' => 'Ce professeur a déjà un salaire actif.'
                ]);
            }
        }

        $profSalaire->update($validated);

        return redirect()->route('prof-salaires.index')
            ->with('flash', [
                'success' => 'Configuration de salaire mise à jour avec succès.'
            ]);
    }

    public function destroy(ProfSalaire $profSalaire)
    {
        $profSalaire->delete();

        return redirect()->route('prof-salaires.index')
            ->with('flash', [
                'success' => 'Configuration de salaire supprimée avec succès.'
            ]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:prof_salaires,id',
            'action' => 'required|in:delete,restore',
        ]);

        $ids = $request->input('ids');

        switch ($request->input('action')) {
            case 'delete':
                ProfSalaire::whereIn('id', $ids)->delete();
                $message = 'Sélections supprimées avec succès.';
                break;

            case 'restore':
                ProfSalaire::onlyTrashed()->whereIn('id', $ids)->restore();
                $message = 'Sélections restaurées avec succès.';
                break;
        }

        return redirect()->back()->with('flash', ['success' => $message]);
    }
}