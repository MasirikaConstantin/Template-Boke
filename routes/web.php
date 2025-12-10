<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\ConfigurationFraiController;
use App\Http\Controllers\ConfigurationFraisController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EleveController;
use App\Http\Controllers\TrancheController;
use App\Models\ConfigurationFrai;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::get('/dashbaord', function () {
    return Inertia::render('Dashboard/Index');
})->name('dashboard')->middleware('auth');


// Authentification
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

// Routes protégées
Route::middleware(['auth'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    
    // Dashboard
    ///Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    // Autres routes protégées...
});


// Routes admin pour les utilisateurs
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::post('/users/bulk-action', [UserController::class, 'bulkAction'])->name('users.bulk-action');
    Route::get('/users/export', [UserController::class, 'export'])->name('users.export');
});
Route::middleware(['auth'])->group(function () {

Route::resource('classes', ClasseController::class);
    Route::post('/classes/bulk-action', [ClasseController::class, 'bulkAction'])->name('classes.bulk-action');
    Route::get('/classes/export', [ClasseController::class, 'export'])->name('classes.export');
    Route::get('/classes/{classe}/rapport', [ClasseController::class, 'rapport'])->name('classes.rapport');


Route::resource('eleves', EleveController::class);
    Route::resource('configuration-frais', ConfigurationFraiController::class);
    Route::post('/configuration-frais/bulk-action', [ConfigurationFraiController::class, 'bulkAction'])
        ->name('configuration-frais.bulk-action');


         Route::resource('tranches', TrancheController::class);
    Route::post('/tranches/bulk-action', [TrancheController::class, 'bulkAction'])
        ->name('tranches.bulk-action');
    
    Route::get('/tranches/by-configuration/{configurationId}', [TrancheController::class, 'getByConfiguration'])
        ->name('tranches.by-configuration');
});