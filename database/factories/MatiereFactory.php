<?php

namespace Database\Factories;

use App\Models\Matiere;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class MatiereFactory extends Factory
{
    protected $model = Matiere::class;

    public function definition(): array
    {
        $niveau = $this->faker->randomElement(['primaire', 'college', 'lycee']);
        $type = $this->faker->randomElement(['obligatoire', 'optionnelle', 'facultative']);

        return [
            // Code matière unique (MATH, FRAN, PHY…)
            'code' => $this->generateCode(),

            'nom' => $nom = $this->faker->randomElement([
                'Mathématiques',
                'Français',
                'Physique',
                'Chimie',
                'Biologie',
                'Histoire',
                'Géographie',
                'Anglais',
                'Informatique',
                'Éducation civique',
            ]),

            'nom_complet' => $nom . ' (' . ucfirst($niveau) . ')',

            'coefficient' => $this->faker->randomFloat(2, 1, 5),

            'niveau' => $niveau,

            'type' => $type,

            'volume_horaire' => $this->faker->optional()->numberBetween(1, 6),

            'ordre_affichage' => $this->faker->numberBetween(0, 20),

            'description' => $this->faker->optional()->sentence(12),

            'est_active' => $this->faker->boolean(85),

            // Professeur existant si possible
            'professeur_id' => User::query()->inRandomOrder()->value('id'),
        ];
    }

    /**
     * Génère un code matière unique lisible
     * ex: MATH, FRAN, PHY, INFO
     */
    protected function generateCode(): string
    {
        static $counter = 1;

        return strtoupper(
            substr($this->faker->unique()->lexify('???'), 0, 3)
        ) . $counter++;
    }

    /* ===================== STATES UTILES ===================== */

    public function primaire(): static
    {
        return $this->state(fn () => [
            'niveau' => 'primaire',
        ]);
    }

    public function college(): static
    {
        return $this->state(fn () => [
            'niveau' => 'college',
        ]);
    }

    public function lycee(): static
    {
        return $this->state(fn () => [
            'niveau' => 'lycee',
        ]);
    }

    public function optionnelle(): static
    {
        return $this->state(fn () => [
            'type' => 'optionnelle',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'est_active' => false,
        ]);
    }
}
