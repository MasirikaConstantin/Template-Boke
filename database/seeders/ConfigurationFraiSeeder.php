<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ConfigurationFrai;
use Illuminate\Support\Str;


class ConfigurationFraiSeeder extends Seeder
{
     public function run(): void
    {
        ConfigurationFrai::factory()
            ->count(3)
            ->create()
            ->each(function ($config) {
                $montantTotal = $config->montant_total;
                $parts = [0.4, 0.3, 0.3];

                foreach ($parts as $index => $ratio) {
                    $config->tranches()->create([
                        'nom_tranche' => ($index + 1) . 'ère tranche',
                        'montant' => round($montantTotal * $ratio, 2),
                        'date_limite' => now()->addMonths($index + 1),
                        'ordre' => $index + 1,
                        'ref' => Str::uuid(),
                    ]);
                }
            });
    }
}
