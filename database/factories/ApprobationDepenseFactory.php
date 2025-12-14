<?php

namespace Database\Factories;

use App\Models\ApprobationDepense;
use App\Models\Depense;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ApprobationDepenseFactory extends Factory
{
    protected $model = ApprobationDepense::class;

    public function definition(): array
    {
        // Dépense existante prioritaire
        $depense = Depense::inRandomOrder()->first()
            ?? Depense::factory()->create();

        // Approbateur
        $user = User::inRandomOrder()->first()
            ?? User::factory()->create();

        $decision = $this->faker->randomElement([
            'approuve',
            'rejete',
            'modifie',
        ]);

        return [
            'depense_id' => $depense->id,
            'user_id' => $user->id,

            'decision' => $decision,
            'commentaire' => $decision !== 'approuve'
                ? $this->faker->optional(0.7)->sentence()
                : $this->faker->optional(0.3)->sentence(),

            'ref' => (string) Str::uuid(),
        ];
    }

    /**
     * Approbation approuvée
     */
    public function approuvee(): static
    {
        return $this->state(fn () => [
            'decision' => 'approuve',
            'commentaire' => 'Dépense approuvée',
        ]);
    }

    /**
     * Approbation rejetée
     */
    public function rejetee(): static
    {
        return $this->state(fn () => [
            'decision' => 'rejete',
            'commentaire' => 'Dépense rejetée après vérification',
        ]);
    }

    /**
     * Approbation avec modification demandée
     */
    public function modifiee(): static
    {
        return $this->state(fn () => [
            'decision' => 'modifie',
            'commentaire' => 'Veuillez corriger ou compléter les informations',
        ]);
    }
}
