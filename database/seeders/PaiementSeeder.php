<?php

namespace Database\Seeders;

use App\Models\Paiement;
use Illuminate\Database\Seeder;

class PaiementSeeder extends Seeder
{
    public function run(): void
    {
        if (
            \App\Models\Eleve::count() === 0 ||
            \App\Models\Tranche::count() === 0 ||
            \App\Models\User::count() === 0
        ) {
            $this->command->warn('Paiements non seedés : données manquantes');
            return;
        }

        Paiement::factory()->count(50)->create();
    }
}
