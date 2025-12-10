<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\ConfigurationFrai;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ConfigurationFraiController extends Controller
{
    public function index(Request $request)
    {
        $query = ConfigurationFrai::query()
            ->orderBy($request->input('sort_by', 'created_at'), $request->input('sort_direction', 'desc'));

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nom_frais', 'like', "%{$search}%")
                  ->orWhere('annee_scolaire', 'like', "%{$search}%");
            });
        }

        if ($request->filled('annee_scolaire')) {
            $query->where('annee_scolaire', $request->annee_scolaire);
        }

        if ($request->filled('est_actif') && $request->est_actif !== 'all') {
            $query->where('est_actif', $request->est_actif === 'true');
        }

        $frais = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $stats = [
            'total' => ConfigurationFrai::count(),
            'actifs' => ConfigurationFrai::where('est_actif', true)->count(),
            'inactifs' => ConfigurationFrai::where('est_actif', false)->count(),
            'montant_total' => ConfigurationFrai::sum('montant_total'),
        ];

        $annees = ConfigurationFrai::distinct('annee_scolaire')->pluck('annee_scolaire');

        return Inertia::render('ConfigurationFrai/Index', [
            'frais' => $frais,
            'filters' => $request->only(['search', 'annee_scolaire', 'est_actif', 'per_page', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'annees' => $annees,
        ]);
    }

    public function create()
    {
        return Inertia::render('ConfigurationFrai/Form');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'annee_scolaire' => 'required|string|max:255',
            'nom_frais' => 'required|string|max:255|unique:configuration_frais,nom_frais',
            'montant_total' => 'required|numeric|min:0',
            'est_actif' => 'boolean',
        ]);

        $validated['ref'] = Str::uuid();

        ConfigurationFrai::create($validated);

        return redirect()->route('configuration-frais.index')
            ->with('success', 'Configuration de frais créée avec succès.');
    }

    public function show(ConfigurationFrai $ConfigurationFrai)
    {
        return Inertia::render('ConfigurationFrai/Show', [
            'frai' => $ConfigurationFrai,
        ]);
    }

    public function edit(ConfigurationFrai $ConfigurationFrai)
    {
        return Inertia::render('ConfigurationFrai/Form', [
            'frai' => $ConfigurationFrai,
        ]);
    }

    public function update(Request $request, ConfigurationFrai $ConfigurationFrai)
    {
        $validated = $request->validate([
            'annee_scolaire' => 'required|string|max:255',
            'nom_frais' => [
                'required',
                'string',
                'max:255',
                Rule::unique('configuration_frais')->ignore($ConfigurationFrai->id),
            ],
            'montant_total' => 'required|numeric|min:0',
            'est_actif' => 'boolean',
        ]);

        $ConfigurationFrai->update($validated);

        return redirect()->route('configuration-frais.index')
            ->with('success', 'Configuration de frais mise à jour avec succès.');
    }

    public function destroy(ConfigurationFrai $ConfigurationFrai)
    {
        $ConfigurationFrai->delete();

        return redirect()->route('configuration-frais.index')
            ->with('success', 'Configuration de frais supprimée avec succès.');
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $ids = $request->input('ids');

        switch ($request->input('action')) {
            case 'activate':
                ConfigurationFrai::whereIn('id', $ids)->update(['est_actif' => true]);
                $message = 'Configurations activées avec succès.';
                break;
            case 'deactivate':
                ConfigurationFrai::whereIn('id', $ids)->update(['est_actif' => false]);
                $message = 'Configurations désactivées avec succès.';
                break;
            case 'delete':
                ConfigurationFrai::whereIn('id', $ids)->delete();
                $message = 'Configurations supprimées avec succès.';
                break;
        }

        return redirect()->back()->with('success', $message);
    }
}