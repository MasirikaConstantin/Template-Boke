<?php

namespace Database\Factories;

use App\Models\ConfigurationFrai;
use App\Models\Tranche;
use App\Models\ConfigurationFrais;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TrancheFactory extends Factory
{
    protected $model = Tranche::class;

    public function definition(): array
    {
        return [
            'configuration_frai_id' => ConfigurationFrai::factory(),
            'nom_tranche' => $this->faker->randomElement([
                '1ère tranche',
                '2ème tranche',
                '3ème tranche',
                'Dernière tranche',
            ]),
            'montant' => $this->faker->numberBetween(50_0, 200_0),
            'date_limite' => $this->faker->dateTimeBetween('now', '+6 months'),
            'ordre' => $this->faker->numberBetween(1, 4),
            'ref' => Str::uuid(),
        ];
    }
}
