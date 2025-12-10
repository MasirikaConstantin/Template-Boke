<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    // Liste des utilisateurs
    public function index(Request $request)
    {
        $search = $request->input('search');
        $role = $request->input('role');
        $status = $request->input('status');
        $perPage = $request->input('per_page', 10);
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');

        $users = User::query()
            ->when($search, fn($query) => $query->search($search))
            ->when($role, fn($query) => $query->where('role', $role))
            ->when($status, fn($query) => $query->where('status', $status))
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'role' => $role,
                'status' => $status,
                'per_page' => $perPage,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'stats' => [
                'total' => User::count(),
                'active' => User::where('status', 'active')->count(),
                'inactive' => User::where('status', 'inactive')->count(),
                'admins' => User::where('role', 'admin')->count(),
            ],
        ]);
    }

    // Formulaire de création
    public function create()
    {
        return Inertia::render('Admin/Users/Create');
    }

    // Stocker un nouvel utilisateur
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,user,moderator',
            'status' => 'required|in:active,inactive,pending',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'status' => $validated['status'],
        ]);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "Utilisateur {$user->name} créé avec succès.");
    }

    // Afficher un utilisateur
    public function show(User $user)
    {
        return Inertia::render('Admin/Users/Show', [
            'user' => $user->load('logs'),
        ]);
    }

    // Formulaire d'édition
    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    }

    // Mettre à jour un utilisateur
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8|confirmed',
            'role' => 'required|in:admin,user,moderator',
            'status' => 'required|in:active,inactive,pending',
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'status' => $validated['status'],
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return redirect()
            ->route('admin.users.index')
            ->with('success', "Utilisateur {$user->name} mis à jour avec succès.");
    }

    // Supprimer un utilisateur
    public function destroy(User $user)
    {
        // Empêcher la suppression de son propre compte
        if ($user->id === Auth::user()->id) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        $userName = $user->name;
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with('success', "Utilisateur {$userName} supprimé avec succès.");
    }

    // Actions en masse
    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id',
            'action' => 'required|in:activate,deactivate,delete',
        ]);

        $users = User::whereIn('id', $request->ids);

        switch ($request->action) {
            case 'activate':
                $users->update(['status' => 'active']);
                $message = 'Utilisateurs activés avec succès.';
                break;
            case 'deactivate':
                $users->update(['status' => 'inactive']);
                $message = 'Utilisateurs désactivés avec succès.';
                break;
            case 'delete':
                // Exclure l'utilisateur courant
                $users->where('id', '!=', Auth::user()->id)->delete();
                $message = 'Utilisateurs supprimés avec succès.';
                break;
        }

        return back()->with('success', $message);
    }

    // Exporter les utilisateurs
    public function export(Request $request)
    {
        $users = User::all();
        
        $csv = \League\Csv\Writer::createFromString('');
        $csv->insertOne(['ID', 'Nom', 'Email', 'Rôle', 'Statut', 'Date de création']);
        
        foreach ($users as $user) {
            $csv->insertOne([
                $user->id,
                $user->name,
                $user->email,
                $user->role,
                $user->status,
                $user->created_at->format('d/m/Y'),
            ]);
        }
        
        return response((string) $csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="utilisateurs-' . date('Y-m-d') . '.csv"',
        ]);
    }
}