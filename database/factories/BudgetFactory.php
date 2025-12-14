<?php

namespace Database\Factories;

use App\Models\Budget;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BudgetFactory extends Factory
{
    protected $model = Budget::class;

    public function definition(): array
    {
        $montantAlloue = $this->faker->randomFloat(2, 500_000, 10_000_000);
        $montantDepense = $this->faker->randomFloat(
            2,
            0,
            $montantAlloue
        );

        return [
            'annee' => (string) $this->faker->numberBetween(2022, 2026),
            'mois' => $this->faker->randomElement([
                'janvier', 'février', 'mars', 'avril',
                'mai', 'juin', 'juillet', 'août',
                'septembre', 'octobre', 'novembre', 'décembre',
            ]),

            'montant_alloue' => $montantAlloue,
            'montant_depense' => $montantDepense,

            // ❌ pas de montant_restant ici (calculé dynamiquement)

            'description' => $this->faker->optional(0.4)->sentence(),
            'est_actif' => $this->faker->boolean(80),
            'ref' => (string) Str::uuid(),
        ];
    }

    /**
     * Budget vide (aucune dépense)
     */
    public function vide(): static
    {
        return $this->state(fn () => [
            'montant_depense' => 0,
        ]);
    }

    /**
     * Budget dépassé (alerte)
     */
    public function depasse(): static
    {
        return $this->state(function () {
            $montant = $this->faker->randomFloat(2, 1_000_000, 5_000_000);

            return [
                'montant_alloue' => $montant,
                'montant_depense' => $montant + $this->faker->randomFloat(2, 10_000, 500_000),
            ];
        });
    }
}
