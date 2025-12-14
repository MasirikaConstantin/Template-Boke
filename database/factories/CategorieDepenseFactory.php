<?php

namespace Database\Factories;

use App\Models\CategorieDepense;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategorieDepenseFactory extends Factory
{
    protected $model = CategorieDepense::class;

    public function definition(): array
    {
        $nom = $this->faker->unique()->words(
            $this->faker->numberBetween(1, 3),
            true
        );

        return [
            'nom_categorie' => ucfirst($nom),

            // Code court, lisible et unique (ex: SALAIRE, FOURNITURE)
            'code' => strtoupper(
                Str::slug($nom, '_')
            ),

            'description' => $this->faker->optional(0.2)->sentence(),
            'est_actif' => $this->faker->boolean(85),
            'ref' => (string) Str::uuid(),
        ];
    }

    /**
     * État : catégorie inactive
     */
    public function inactive(): static
    {
        return $this->state(fn () => [
            'est_actif' => false,
        ]);
    }
}
