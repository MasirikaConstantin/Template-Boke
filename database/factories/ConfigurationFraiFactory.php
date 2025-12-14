<?php

namespace Database\Factories;

use App\Models\ConfigurationFrai;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\ConfigurationFrai>
 */
class ConfigurationFraiFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected $model = ConfigurationFrai::class;

    public function definition(): array
    {
        $anneeDebut = $this->faker->numberBetween(2020, now()->year);
        $anneeScolaire = $anneeDebut . '-' . ($anneeDebut + 1);

        return [
            'annee_scolaire' => $anneeScolaire,
            'nom_frais' => $this->faker->randomElement([
                'Frais scolaires',
                'Frais d’inscription',
                'Frais académiques',
                'Frais de fonctionnement',
            ]),
            'montant_total' => $this->faker->numberBetween(200_0, 1_500_0),
            'est_actif' => $this->faker->boolean(80), // 80 % actifs
            'ref' => Str::uuid(),
        ];
    }

    /**
     * Forcer une configuration active
     */
    public function actif(): static
    {
        return $this->state(fn () => [
            'est_actif' => true,
        ]);
    }
}
