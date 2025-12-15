<?php

namespace App\Http\Controllers;

use App\Models\Presence;
use App\Models\Professeur;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PresenceController extends Controller
{
    public function index(Request $request)
    {
        $query = Presence::with('professeur')
            ->active()
            ->when($request->search, function ($q, $search) {
                $q->whereHas('professeur', function ($q) use ($search) {
                    $q->where('.nom', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('ref', 'like', "%{$search}%");
            })
            ->when($request->professeur_id && $request->professeur_id !== 'all', function ($q, $professeurId) {
                $q->where('professeur_id', $professeurId);
            })
            ->when($request->date_debut && $request->date_fin, function ($q) use ($request) {
                $q->whereBetween('date', [$request->date_debut, $request->date_fin]);
            }, function ($q) {
                // Par défaut, afficher le mois en cours
                $q->whereMonth('date', now()->month)
                  ->whereYear('date', now()->year);
            })
            ->when($request->statut && $request->statut !== 'all', function ($q, $statut) {
                if ($statut === 'present') {
                    $q->whereNotNull('heure_arrivee');
                } elseif ($statut === 'absent') {
                    $q->whereNull('heure_arrivee')->whereNull('heure_depart');
                } elseif ($statut === 'complete') {
                    $q->whereNotNull('heure_arrivee')->whereNotNull('heure_depart');
                }
            });

        // Gestion du tri
        $sortBy = $request->input('sort_by', 'date');
        $sortDirection = $request->input('sort_direction', 'desc');
        
        if (in_array($sortBy, ['professeur.nom', 'date', 'heure_arrivee'])) {
            if ($sortBy === 'professeur.nom') {
                $query->join('professeurs', 'presences.professeur_id', '=', 'professeurs.id')
                      ->orderBy('professeurs.nom', $sortDirection);
            } else {
                $query->orderBy($sortBy, $sortDirection);
            }
        } else {
            $query->orderBy('date', 'desc')->orderBy('heure_arrivee', 'desc');
        }

        $presences = $query->paginate($request->input('per_page', 20));

        // Statistiques
        $stats = [
            'total' => Presence::active()
                ->when($request->date_debut && $request->date_fin, function ($q) use ($request) {
                    $q->whereBetween('date', [$request->date_debut, $request->date_fin]);
                }, function ($q) {
                    $q->whereMonth('date', now()->month)
                      ->whereYear('date', now()->year);
                })->count(),
            'present' => Presence::active()
                ->when($request->date_debut && $request->date_fin, function ($q) use ($request) {
                    $q->whereBetween('date', [$request->date_debut, $request->date_fin]);
                }, function ($q) {
                    $q->whereMonth('date', now()->month)
                      ->whereYear('date', now()->year);
                })
                ->whereNotNull('heure_arrivee')
                ->count(),
            'absent' => Presence::active()
                ->when($request->date_debut && $request->date_fin, function ($q) use ($request) {
                    $q->whereBetween('date', [$request->date_debut, $request->date_fin]);
                }, function ($q) {
                    $q->whereMonth('date', now()->month)
                      ->whereYear('date', now()->year);
                })
                ->whereNull('heure_arrivee')
                ->whereNull('heure_depart')
                ->count(),
           'total_heures' => abs(
    (float) Presence::active()
        ->when(
            $request->date_debut && $request->date_fin,
            fn ($q) => $q->whereBetween('date', [$request->date_debut, $request->date_fin]),
            fn ($q) => $q->whereMonth('date', now()->month)
                         ->whereYear('date', now()->year)
        )
        ->sum('heures_prestées')
),

        ];

        $professeurs = Professeur::active()->get(['id', '.nom', 'email']);
        $dates = $this->getAvailableDates();

        return Inertia::render('Presences/Index', [
            'presences' => $presences,
            'filters' => $request->only(['search', 'professeur_id', 'date_debut', 'date_fin', 'statut', 'per_page', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'professeurs' => $professeurs,
            'dates' => $dates,
            'flash' => session('flash', [])
        ]);
    }

    public function create()
    {
        $professeurs = Professeur::active()->get(['id', '.nom', 'email']);
        $today = now()->format('Y-m-d');
        
        return Inertia::render('Presences/Create', [
            'professeurs' => $professeurs,
            'today' => $today,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'date' => 'required|date',
            'heure_arrivee' => 'nullable|date_format:H:i',
            'heure_depart' => 'nullable|date_format:H:i|after_or_equal:heure_arrivee',
        ], [
            'heure_depart.after_or_equal' => "L'heure de départ doit être après l'heure d'arrivée",
        ]);

        // Vérifier si une présence existe déjà pour ce professeur à cette date
        $existingPresence = Presence::where('professeur_id', $validated['professeur_id'])
            ->whereDate('date', $validated['date'])
            ->active()
            ->first();

        if ($existingPresence) {
            return redirect()->back()->withErrors([
                'date' => 'Une présence existe déjà pour ce professeur à cette date.'
            ]);
        }

        Presence::create($validated);

        return redirect()->route('presences.index')
            ->with('flash', [
                'success' => 'Présence enregistrée avec succès.'
            ]);
    }

    public function show(Presence $presence)
    {
        $presence->load('professeur');

        return Inertia::render('Presences/Show', [
            'presence' => $presence,
        ]);
    }

    public function edit(Presence $presence)
    {
        $professeurs = Professeur::active()->get(['id', '.nom', 'email']);

        return Inertia::render('Presences/Edit', [
            'presence' => $presence,
            'professeurs' => $professeurs,
        ]);
    }

    public function update(Request $request, Presence $presence)
    {
        $validated = $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'date' => 'required|date',
            'heure_arrivee' => 'nullable|date_format:H:i',
            'heure_depart' => 'nullable|date_format:H:i|after_or_equal:heure_arrivee',
        ], [
            'heure_depart.after_or_equal' => "L'heure de départ doit être après l'heure d'arrivée",
        ]);

        // Vérifier si une autre présence existe déjà pour ce professeur à cette date
        if ($presence->professeur_id != $validated['professeur_id'] || 
            $presence->date->format('Y-m-d') != $validated['date']) {
            
            $existingPresence = Presence::where('professeur_id', $validated['professeur_id'])
                ->whereDate('date', $validated['date'])
                ->where('id', '!=', $presence->id)
                ->active()
                ->first();

            if ($existingPresence) {
                return redirect()->back()->withErrors([
                    'date' => 'Une présence existe déjà pour ce professeur à cette date.'
                ]);
            }
        }

        $presence->update($validated);

        return redirect()->route('presences.index')
            ->with('flash', [
                'success' => 'Présence mise à jour avec succès.'
            ]);
    }

    public function destroy(Presence $presence)
    {
        $presence->delete();

        return redirect()->route('presences.index')
            ->with('flash', [
                'success' => 'Présence supprimée avec succès.'
            ]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:presences,id',
            'action' => 'required|in:delete,mark_present,mark_absent',
        ]);

        $ids = $request->input('ids');

        switch ($request->input('action')) {
            case 'delete':
                Presence::whereIn('id', $ids)->delete();
                $message = 'Sélections supprimées avec succès.';
                break;

            case 'mark_present':
                $now = now()->format('H:i');
                Presence::whereIn('id', $ids)->update([
                    'heure_arrivee' => $now,
                    'heure_depart' => null,
                ]);
                $message = 'Sélections marquées comme présentes.';
                break;

            case 'mark_absent':
                Presence::whereIn('id', $ids)->update([
                    'heure_arrivee' => null,
                    'heure_depart' => null,
                ]);
                $message = 'Sélections marquées comme absentes.';
                break;
        }

        return redirect()->back()->with('flash', ['success' => $message]);
    }

    public function marquerPresence(Request $request)
    {
        $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'type' => 'required|in:arrivee,depart',
        ]);

        $today = now()->format('Y-m-d');
        $nowTime = now()->format('H:i');

        // Rechercher la présence du jour
        $presence = Presence::where('professeur_id', $request->professeur_id)
            ->whereDate('date', $today)
            ->active()
            ->first();

        if (!$presence) {
            // Créer une nouvelle présence
            $presence = Presence::create([
                'professeur_id' => $request->professeur_id,
                'date' => $today,
                'heure_arrivee' => $request->type === 'arrivee' ? $nowTime : null,
                'heure_depart' => $request->type === 'depart' ? $nowTime : null,
            ]);
        } else {
            // Mettre à jour la présence existante
            if ($request->type === 'arrivee') {
                $presence->heure_arrivee = $nowTime;
            } else {
                $presence->heure_depart = $nowTime;
            }
            $presence->save();
        }

        return back()->with('flash', [
            'success' => 'Présence marquée avec succès.'
        ]);
    }

    public function rapport(Request $request)
    {
        $request->validate([
            'professeur_id' => 'required|exists:professeurs,id',
            'mois' => 'required|integer|min:1|max:12',
            'annee' => 'required|integer|min:2020|max:2030',
        ]);

        $professeur = Professeur::findOrFail($request->professeur_id);

        $presences = Presence::where('professeur_id', $request->professeur_id)
            ->whereMonth('date', $request->mois)
            ->whereYear('date', $request->annee)
            ->active()
            ->orderBy('date')
            ->get();

        $totalHeures = $presences->sum('heures_prestées');
        $joursPresents = $presences->where('is_present', true)->count();
        $joursAbsents = $presences->where('is_absent', true)->count();

        return response()->json([
            'professeur' => $professeur,
            'presences' => $presences,
            'stats' => [
                'total_heures' => $totalHeures,
                'jours_presents' => $joursPresents,
                'jours_absents' => $joursAbsents,
                'mois' => Carbon::create($request->annee, $request->mois, 1)->monthName,
                'annee' => $request->annee,
            ]
        ]);
    }

    private function getAvailableDates()
    {
        $dates = Presence::select('date')
            ->active()
            ->orderBy('date', 'desc')
            ->distinct()
            ->take(100)
            ->get()
            ->pluck('date')
            ->map(function ($date) {
                return [
                    'value' => $date->format('Y-m-d'),
                    'label' => $date->format('d/m/Y'),
                ];
            });

        return $dates;
    }
}