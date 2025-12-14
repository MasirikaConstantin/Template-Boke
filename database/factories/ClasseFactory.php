<?php

namespace Database\Factories;

use App\Models\Classe;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ClasseFactory extends Factory
{
    protected $model = Classe::class;

    public function definition(): array
    {
        $niveau = $this->faker->randomElement(['primaire', 'secondaire']);

        return [
            'nom_classe' => $niveau === 'primaire'
                ? $this->faker->randomElement(['1ère', '2ème', '3ème', '4ème', '5ème', '6ème'])
                : $this->faker->randomElement(['1ère', '2ème', '3ème', '4ème', '5ème', '6ème', '7ème', '8ème']),

            'niveau' => $niveau,

            'section' => $niveau === 'secondaire'
                ? $this->faker->randomElement(['A', 'B', 'C', 'Commerciale', 'Scientifique', 'Littéraire'])
                : null,

            'ref' => Str::uuid(),

            'professeur_principal_id' => User::inRandomOrder()->value('id'),

            'capacite_max' => $this->faker->numberBetween(25, 45),

            'nombre_eleves' => 0,

            'statut' => $this->faker->randomElement(['active', 'inactive']),

            'description' => $this->faker->optional()->sentence(10),
        ];
    }

    /**
     * Classe active uniquement
     */
    public function active(): static
    {
        return $this->state(fn () => [
            'statut' => 'active',
        ]);
    }

    /**
     * Classe archivée
     */
    public function archived(): static
    {
        return $this->state(fn () => [
            'statut' => 'archived',
        ]);
    }

    /**
     * Classe primaire
     */
    public function primaire(): static
    {
        return $this->state(fn () => [
            'niveau' => 'primaire',
            'section' => null,
        ]);
    }

    /**
     * Classe secondaire
     */
    public function secondaire(): static
    {
        return $this->state(fn () => [
            'niveau' => 'secondaire',
            'section' => $this->faker->randomElement(['A', 'B', 'C', 'Commerciale', 'Scientifique']),
        ]);
    }
}
