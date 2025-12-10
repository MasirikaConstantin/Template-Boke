<?php
namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Tranche;
use App\Models\ConfigurationFrai;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TrancheController extends Controller
{
    public function index(Request $request)
    {
        $query = Tranche::query()
            ->with('configuration_frais')
            ->orderBy($request->input('sort_by', 'created_at'), $request->input('sort_direction', 'desc'));

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('nom_tranche', 'like', "%{$search}%")
                  ->orWhereHas('configuration_frais', function ($q) use ($search) {
                      $q->where('nom_frais', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('configuration_frai_id')) {
            $query->where('configuration_frai_id', $request->configuration_frai_id);
        }

        $tranches = $query->paginate($request->input('per_page', 10))
            ->withQueryString();

        $configurations = ConfigurationFrai::where('est_actif', true)
            ->orderBy('annee_scolaire', 'desc')
            ->orderBy('nom_frais')
            ->get();

        $stats = [
            'total' => Tranche::count(),
            'montant_total' => Tranche::sum('montant'),
            'prochaines_echeances' => Tranche::where('date_limite', '>=', now())
                ->orderBy('date_limite')
                ->limit(5)
                ->count(),
        ];

        return Inertia::render('Tranches/Index', [
            'tranches' => $tranches,
            'filters' => $request->only(['search', 'configuration_frai_id', 'per_page', 'sort_by', 'sort_direction']),
            'stats' => $stats,
            'configurations' => $configurations,
        ]);
    }

    public function create()
    {
        $configurations = ConfigurationFrai::where('est_actif', true)
            ->orderBy('annee_scolaire', 'desc')
            ->orderBy('nom_frais')
            ->get();

        return Inertia::render('Tranches/Form', [
            'configurations' => $configurations,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'configuration_frai_id' => 'required|exists:configuration_frais,id',
            'nom_tranche' => 'required|string|max:255',
            'montant' => 'required|numeric|min:0',
            'date_limite' => 'required|date|after:today',
            'ordre' => 'required|integer|min:1',
        ]);

        $validated['ref'] = Str::uuid();

        // Vérifier l'unicité de l'ordre pour cette configuration
        $existing = Tranche::where('configuration_frai_id', $validated['configuration_frai_id'])
            ->where('ordre', $validated['ordre'])
            ->exists();

        if ($existing) {
            return back()->withErrors([
                'ordre' => 'Cet ordre existe déjà pour cette configuration de frais.'
            ]);
        }

        Tranche::create($validated);

        return redirect()->route('tranches.index')
            ->with('success', 'Tranche créée avec succès.');
    }

    public function show(string $tranche)
    {
        $tranche = Tranche::findOrFail($tranche);
        $tranche->load('configuration_frais');

        return Inertia::render('Tranches/Show', [
            'tranche' => $tranche,
        ]);
    }

    public function edit(Tranche $tranche)
    {
        $tranche->load('configuration_frais');
        
        $configurations = ConfigurationFrai::where('est_actif', true)
            ->orderBy('annee_scolaire', 'desc')
            ->orderBy('nom_frais')
            ->get();

        return Inertia::render('Tranches/Form', [
            'tranche' => $tranche,
            'configurations' => $configurations,
        ]);
    }

    public function update(Request $request, Tranche $tranche)
    {
        $validated = $request->validate([
            'configuration_frai_id' => 'required|exists:configuration_frais,id',
            'nom_tranche' => 'required|string|max:255',
            'montant' => 'required|numeric|min:0',
            'date_limite' => 'required|date',
            'ordre' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('tranches')
                    ->where('configuration_frai_id', $validated['configuration_frai_id'])
                    ->ignore($tranche->id)
            ],
        ]);

        $tranche->update($validated);

        return redirect()->route('tranches.index')
            ->with('success', 'Tranche mise à jour avec succès.');
    }

    public function destroy(Tranche $tranche)
    {
        $tranche->delete();

        return redirect()->route('tranches.index')
            ->with('success', 'Tranche supprimée avec succès.');
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:delete',
        ]);

        $ids = $request->input('ids');

        Tranche::whereIn('id', $ids)->delete();

        return redirect()->back()->with('success', 'Tranches supprimées avec succès.');
    }

    public function getByConfiguration($configurationId)
    {
        $tranches = Tranche::where('configuration_frai_id', $configurationId)
            ->orderBy('ordre')
            ->get();

        return response()->json($tranches);
    }
}