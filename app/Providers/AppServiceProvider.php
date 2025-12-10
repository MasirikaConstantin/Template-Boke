<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot()
{
    // Configuration des fonts pour DomPDF
    if (!file_exists(storage_path('fonts'))) {
        mkdir(storage_path('fonts'), 0755, true);
    }
    
    // Copier les fonts nécessaires si elles n'existent pas
    $fontFiles = [
        'DejaVuSans.ttf' => public_path('fonts/DejaVuSans.ttf'),
        'DejaVuSans-Bold.ttf' => public_path('fonts/DejaVuSans-Bold.ttf'),
    ];
    
    foreach ($fontFiles as $destName => $sourcePath) {
        $destPath = storage_path('fonts/' . $destName);
        if (!file_exists($destPath) && file_exists($sourcePath)) {
            copy($sourcePath, $destPath);
        }
    }
}
}
