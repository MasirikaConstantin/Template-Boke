<?php

namespace Database\Seeders;

use App\Models\HistoriquePaiement;
use App\Models\Paiement;
use Illuminate\Database\Seeder;

class HistoriquePaiementSeeder extends Seeder
{
    public function run(): void
    {
        if (Paiement::count() === 0) {
            $this->command->warn('Historique paiements non seedé : aucun paiement trouvé');
            return;
        }

        // 1 à 3 actions par paiement
        Paiement::all()->each(function ($paiement) {
            HistoriquePaiement::factory()
                ->count(rand(1, 3))
                ->state([
                    'paiement_id' => $paiement->id,
                ])
                ->create();
        });
    }
}
