<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvanceSalaireController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CaisseController;
use App\Http\Controllers\CategorieDepenseController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\ConfigurationFraiController;
use App\Http\Controllers\ConfigurationFraisController;
use App\Http\Controllers\DepenseController;
use App\Http\Controllers\EleveController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\PaiementSalaireController;
use App\Http\Controllers\PresenceController;
use App\Http\Controllers\ProfSalaireController;
use App\Http\Controllers\RecouvrementController;
use App\Http\Controllers\ResponsableController;
use App\Http\Controllers\TrancheController;
use App\Models\ConfigurationFrai;
use App\Models\Professeur;
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
    Route::get('/paiements/rapport', [PaiementController::class, 'rapport'])
        ->name('paiements.rapport');
    Route::resource('paiements', PaiementController::class);
    Route::post('/paiements/bulk-action', [PaiementController::class, 'bulkAction'])
        ->name('paiements.bulk-action');
    Route::get('/recouvrement', [RecouvrementController::class, 'index'])
        ->name('recouvrement.index');

    Route::get('/recouvrement/generer-rapport', [RecouvrementController::class, 'genererRapport'])
        ->name('recouvrement.generer-rapport');

    Route::post('/recouvrement/envoyer-rappels', [RecouvrementController::class, 'envoyerRappels'])
        ->name('recouvrement.envoyer-rappels');

    // Budgets
    Route::resource('budgets', BudgetController::class);
    Route::post('/budgets/{budget}/dupliquer', [BudgetController::class, 'dupliquer'])
        ->name('budgets.dupliquer');

    // Catégories de dépenses
    Route::resource('categories-depense', CategorieDepenseController::class);
    Route::get('/categories-depense', [CategorieDepenseController::class, 'index'])
        ->name('categories-depense.index');

    // Dépenses
    Route::resource('depenses', DepenseController::class);
    Route::post('/depenses/{depense}/approuver', [DepenseController::class, 'approuver'])
        ->name('depenses.approuver');
    Route::post('/depenses/{depense}/marquer-comme-paye', [DepenseController::class, 'marquerCommePaye'])
        ->name('depenses.marquer-comme-paye');

    Route::get('/caisse', [CaisseController::class, 'index'])->name('caisse.index');
    Route::get('/caisse/export', [CaisseController::class, 'export'])->name('caisse.export');

    // Routes supplémentaires si besoin
    Route::get('/caisse/solde', [CaisseController::class, 'solde'])->name('caisse.solde');
    Route::post('/caisse/fermeture', [CaisseController::class, 'fermeture'])->name('caisse.fermeture');

    // Routes Responsables
    Route::resource('responsables', ResponsableController::class);
    
    // Routes supplémentaires
    Route::post('responsables/{responsable}/attach-eleve', [ResponsableController::class, 'attachEleve'])
        ->name('responsables.attach-eleve');
    
    Route::delete('responsables/{responsable}/detach-eleve/{eleve}', [ResponsableController::class, 'detachEleve'])
        ->name('responsables.detach-eleve');
    
    Route::get('responsables/{responsable}/eleves', [ResponsableController::class, 'eleves'])
        ->name('responsables.eleves');
    
    Route::post('responsables/bulk-action', [ResponsableController::class, 'bulkAction'])
        ->name('responsables.bulk-action');

         /*Route::get('relever', [\App\Http\Controllers\ResponsableController::class, 'relever'])
        ->name('responsables.relever');
    */
    Route::get('relever/eleve/{eleve}', [\App\Http\Controllers\ResponsableController::class, 'releverEleve'])
        ->name('responsables.relever.eleve');
        Route::get('/responsables/{responsable}/relever', [ResponsableController::class, 'relever'])
    ->name('responsables.relever');



    // Routes professeurs
Route::resource('professeurs', \App\Http\Controllers\ProfesseurController::class)
    ->middleware(['auth', 'verified']);

// Routes pour les affectations
Route::prefix('professeurs/{professeur}')->group(function () {
    Route::post('affecter-classe', [\App\Http\Controllers\ProfesseurController::class, 'affecterClasse'])
        ->name('professeurs.affecter-classe');
    
    Route::delete('desaffecter-classe/{classe}/{matiere}', [\App\Http\Controllers\ProfesseurController::class, 'desaffecterClasse'])
        ->name('professeurs.desaffecter-classe');
    
    Route::get('affectation', function (Professeur $professeur) {
        return Inertia::render('Professeurs/Affectation', [
            'professeur' => $professeur->load(['classes', 'matieresEnseignees']),
        ]);
    })->name('professeurs.affectation');
});

// Actions groupées
Route::post('professeurs/bulk-action', [\App\Http\Controllers\ProfesseurController::class, 'bulkAction'])
    ->name('professeurs.bulk-action');

     Route::resource('prof-salaires', ProfSalaireController::class)->except(['show']);
    Route::get('prof-salaires/{profSalaire}', [ProfSalaireController::class, 'show'])->name('prof-salaires.show');
    Route::post('prof-salaires/bulk-action', [ProfSalaireController::class, 'bulkAction'])->name('prof-salaires.bulk-action');
});
Route::resource('presences', PresenceController::class)->except(['show']);
    Route::get('presences/{presence}', [PresenceController::class, 'show'])->name('presences.show');
    Route::post('presences/bulk-action', [PresenceController::class, 'bulkAction'])->name('presences.bulk-action');
    Route::post('presences/marquer', [PresenceController::class, 'marquerPresence'])->name('presences.marquer');
    Route::get('presences/rapport', [PresenceController::class, 'rapport'])->name('presences.rapport');





  // Routes pour les avances sur salaires
    Route::resource('avance-salaires', AvanceSalaireController::class)->except(['show']);
    Route::get('avance-salaires/{avanceSalaire}', [AvanceSalaireController::class, 'show'])->name('avance-salaires.show');
    Route::post('avance-salaires/bulk-action', [AvanceSalaireController::class, 'bulkAction'])->name('avance-salaires.bulk-action');
    Route::post('avance-salaires/{avanceSalaire}/approuver', [AvanceSalaireController::class, 'approuver'])->name('avance-salaires.approuver');
    Route::post('avance-salaires/{avanceSalaire}/payer', [AvanceSalaireController::class, 'payer'])->name('avance-salaires.payer');

    // Routes pour les paiements de salaires
    Route::resource('paiement-salaires', PaiementSalaireController::class)->except(['show']);
    Route::get('paiement-salaires/{paiementSalaire}', [PaiementSalaireController::class, 'show'])->name('paiement-salaires.show');
    Route::post('paiement-salaires/bulk-action', [PaiementSalaireController::class, 'bulkAction'])->name('paiement-salaires.bulk-action');
    Route::post('paiement-salaires/calculer', [PaiementSalaireController::class, 'calculerPaiementAutomatique'])->name('paiement-salaires.calculer');
    Route::get('paiement-salaires/{paiementSalaire}/bulletin', [PaiementSalaireController::class, 'genererBulletin'])->name('paiement-salaires.bulletin');




    
















Route::prefix('api/v1')->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'index']);

    // Vous pouvez ajouter plus d'endpoints spécifiques
    Route::get('/dashboard/activities', [DashboardController::class, 'activities']);
    Route::get('/dashboard/chart-data', [DashboardController::class, 'chartData']);


});
