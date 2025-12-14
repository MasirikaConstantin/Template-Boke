<?php

namespace Database\Factories;

use App\Models\Evaluation;
use App\Models\Matiere;
use App\Models\Classe;
use App\Models\Trimestre;
use Illuminate\Database\Eloquent\Factories\Factory;

class EvaluationFactory extends Factory
{
    protected $model = Evaluation::class;

    public function definition(): array
    {
        return [
            'nom' => $this->faker->randomElement([
                'Devoir 1',
                'Devoir 2',
                'Interrogation',
                'Composition trimestrielle',
            ]),

            'type' => $this->faker->randomElement(['devoir', 'composition', 'oral']),

            'coefficient' => $this->faker->randomFloat(2, 1, 3),
            'bareme' => 20,

            'date_evaluation' => now()->subDays(rand(1, 60)),
            'heure_debut' => null,
            'heure_fin' => null,

            'matiere_id' => Matiere::inRandomOrder()->value('id'),
            'classe_id' => Classe::inRandomOrder()->value('id'),
            'trimestre_id' => Trimestre::inRandomOrder()->value('id'),

            'description' => $this->faker->optional()->sentence(10),
            'competences_evaluees' => null,
            'est_obligatoire' => true,
            'est_terminee' => true,
        ];
    }
}
