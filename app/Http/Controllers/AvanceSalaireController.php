<?php

namespace App\Http\Controllers;

use App\Models\AvanceSalaire;
use App\Models\Professeur;
use App\Models\ProfSalaire;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AvanceSalaireController extends Controller
{
    public function index(Request $request)
    {
        $query = AvanceSalaire::with(['professeur', 'approbateur'])
            ->active()
            ->when($request->search, function ($q, $search) {
                $q->whereHas('professeur', function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('ref', 'like', "%{$search}%");
            })
            ->when($request->professeur_id && $request->professeur_id !== 'all', function ($q, $professeurId) {
                $q->where('professeur_id', $professeurId);
            })
            ->when($request->statut && $request->statut !== 'all', function ($q, $statut) {
                $q->where('statut', $statut);
            })
            ->when($request->date_debut && $request->date_fin, function ($q) use ($request) {
                $q->whereBetween('date_avance', [$request->date_debut, $request->date_fin]);
            });

        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        $query->orderBy($sortBy, $sortDirection);

        $avances = $query->paginate($request->input('per_page', 10));

        $stats = [
            'total' => AvanceSalaire::active()->count(),
            'demandee' => AvanceSalaire::demandee()->count(),
            'approuvee' => AvanceSalaire::approuvee()->count(),
            'payee' => AvanceSalaire::payee()->count(),
            'deduite' => AvanceSalaire::deduite()->count(),
            'total_montant' => AvanceSalaire::active()->sum('montant'),
        ];

        $professeurs = Professeur::active()->get(['id', 'nom', 'email']);

        return Inertia::render('AvanceSalaires/Index', [
            'avances' => $avances,
            'filters' => $request->only(['search', 'professeur_id', 'statut', 'date_debut', 'date_fin', 'per_page', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'professeurs' => $professeurs,
            'flash' => session('flash', [])
        ]);
    }

    public function create()
    {
        $professeurs = Professeur::active()->with(["salaires"])->get(['id', 'nom', 'email']);
        $today = now()->format('Y-m-d');
        
        return Inertia::render('AvanceSalaires/Create', [
            'professeurs' => $professeurs,
            'today' => $today,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'montant' => 'required|numeric|min:1|max:100000',
            'date_avance' => 'required|date',
            'statut' => 'sometimes|in:demandee,approuvee,payee',
        ]);

        // Vérifier si le professeur a un salaire configuré
        $profSalaire = ProfSalaire::where('professeur_id', $validated['professeur_id'])
            ->active()
            ->first();

        if (!$profSalaire) {
            return redirect()->back()->withErrors([
                'professeur_id' => 'Ce professeur n\'a pas de configuration de salaire.'
            ]);
        }

        // Calculer le maximum d'avance possible (par exemple 50% du salaire mensuel)
        $salaireMensuel = $profSalaire->type_salaire === 'horaire' 
            ? $profSalaire->taux_horaire * 35 * 4.33
            : $profSalaire->salaire_fixe;

        $maxAvance = $salaireMensuel * 0.5; // 50% du salaire

        if ($validated['montant'] > $maxAvance) {
            return redirect()->back()->withErrors([
                'montant' => "Le montant ne peut pas dépasser 50% du salaire mensuel ({$maxAvance} $)."
            ]);
        }

        // Vérifier les avances en cours
        $avancesEnCours = AvanceSalaire::where('professeur_id', $validated['professeur_id'])
            ->whereIn('statut', ['demandee', 'approuvee', 'payee'])
            ->sum('montant');

        if ($avancesEnCours + $validated['montant'] > $salaireMensuel) {
            return redirect()->back()->withErrors([
                'montant' => 'Le total des avances dépasse le salaire mensuel.'
            ]);
        }

        $avance = AvanceSalaire::create($validated);

        return redirect()->route('avance-salaires.index')
            ->with('flash', [
                'success' => 'Demande d\'avance créée avec succès.'
            ]);
    }

    public function show(AvanceSalaire $avanceSalaire)
    {
        $avanceSalaire->load(['professeur', 'approbateur', 'paiements']);

        return Inertia::render('AvanceSalaires/Show', [
            'avance' => $avanceSalaire,
        ]);
    }

    public function edit(AvanceSalaire $avanceSalaire)
    {
        $professeurs = Professeur::active()->get(['id', 'nom', 'email']);

        return Inertia::render('AvanceSalaires/Edit', [
            'avance' => $avanceSalaire,
            'professeurs' => $professeurs,
        ]);
    }

    public function update(Request $request, AvanceSalaire $avanceSalaire)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'montant' => 'required|numeric|min:1|max:100000',
            'date_avance' => 'required|date',
            'statut' => 'sometimes|in:demandee,approuvee,payee,deduite',
        ]);

        $avanceSalaire->update($validated);

        return redirect()->route('avance-salaires.index')
            ->with('flash', [
                'success' => 'Avance mise à jour avec succès.'
            ]);
    }

    public function destroy(AvanceSalaire $avanceSalaire)
    {
        $avanceSalaire->delete();

        return redirect()->route('avance-salaires.index')
            ->with('flash', [
                'success' => 'Avance supprimée avec succès.'
            ]);
    }

    public function approuver(AvanceSalaire $avanceSalaire)
    {
        if (!$avanceSalaire->peutEtreApprouvee()) {
            return redirect()->back()
                ->with('flash', [
                    'error' => 'Cette avance ne peut pas être approuvée.'
                ]);
        }

        $avanceSalaire->approuver(auth()->user());

        return redirect()->back()
            ->with('flash', [
                'success' => 'Avance approuvée avec succès.'
            ]);
    }

    public function payer(AvanceSalaire $avanceSalaire)
    {
        if (!$avanceSalaire->peutEtrePayee()) {
            return redirect()->back()
                ->with('flash', [
                    'error' => 'Cette avance ne peut pas être payée.'
                ]);
        }

        $avanceSalaire->payer();

        return redirect()->back()
            ->with('flash', [
                'success' => 'Avance marquée comme payée.'
            ]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:avance_salaires,id',
            'action' => 'required|in:delete,approuver,payer',
        ]);

        $ids = $request->input('ids');

        switch ($request->input('action')) {
            case 'delete':
                AvanceSalaire::whereIn('id', $ids)->delete();
                $message = 'Avances supprimées avec succès.';
                break;

            case 'approuver':
                AvanceSalaire::whereIn('id', $ids)
                    ->where('statut', 'demandee')
                    ->each(function ($avance) {
                        $avance->approuver(auth()->user());
                    });
                $message = 'Avances approuvées avec succès.';
                break;

            case 'payer':
                AvanceSalaire::whereIn('id', $ids)
                    ->where('statut', 'approuvee')
                    ->each(function ($avance) {
                        $avance->payer();
                    });
                $message = 'Avances marquées comme payées.';
                break;
        }

        return redirect()->back()->with('flash', ['success' => $message]);
    }
}