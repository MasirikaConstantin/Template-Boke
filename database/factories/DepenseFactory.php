<?php

namespace Database\Factories;

use App\Models\Depense;
use App\Models\Budget;
use App\Models\CategorieDepense;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class DepenseFactory extends Factory
{
    protected $model = Depense::class;

    public function definition(): array
    {
        // Relations existantes (priorité aux données déjà créées)
        $budget = $this->faker->boolean(70)
            ? Budget::inRandomOrder()->first()
            : null;

        $categorie = CategorieDepense::inRandomOrder()->first()
            ?? CategorieDepense::factory()->create();

        $user = User::inRandomOrder()->first()
            ?? User::factory()->create();

        $montant = $this->faker->randomFloat(2, 5_000, 2_000_000);

        return [
            'budget_id' => $budget?->id,
            'categorie_depense_id' => $categorie->id,
            'user_id' => $user->id,

            // Référence unique lisible
            'reference' => 'DEP-' . now()->format('Y') . '-' . $this->faker->unique()->numberBetween(100000, 999999),

            'libelle' => ucfirst($this->faker->words(3, true)),
            'montant' => $montant,

            'mode_paiement' => $this->faker->randomElement([
                'espèce', 'chèque', 'virement', 'carte'
            ]),

            'beneficiaire' => $this->faker->name(),
            'description' => $this->faker->optional(0.4)->sentence(),

            'date_depense' => $this->faker->dateTimeBetween('-6 months', 'now')->format('Y-m-d'),

            'numero_piece' => $this->faker->optional(0.4)->bothify('FAC-####'),
            'fichier_joint' => $this->faker->optional(0.3)
                ? 'depenses/factures/' . Str::random(12) . '.pdf'
                : null,

            'statut' => $this->faker->randomElement([
                'brouillon', 'en_attente', 'approuve', 'paye'
            ]),

            'ref' => (string) Str::uuid(),
        ];
    }

    /**
     * Dépense en brouillon
     */
    public function brouillon(): static
    {
        return $this->state(fn () => [
            'statut' => 'brouillon',
        ]);
    }

    /**
     * Dépense approuvée
     */
    public function approuvee(): static
    {
        return $this->state(fn () => [
            'statut' => 'approuve',
        ]);
    }

    /**
     * Dépense payée
     */
    public function payee(): static
    {
        return $this->state(fn () => [
            'statut' => 'paye',
        ]);
    }

    /**
     * Dépense rejetée
     */
    public function rejetee(): static
    {
        return $this->state(fn () => [
            'statut' => 'rejete',
        ]);
    }
}
