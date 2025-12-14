<?php

namespace Database\Factories;

use App\Models\Trimestre;
use App\Models\AnneScolaire;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrimestreFactory extends Factory
{
    protected $model = Trimestre::class;

    public function definition(): array
    {
        return [
            'nom' => 'Trimestre',
            'numero' => 1,
            'date_debut' => now(),
            'date_fin' => now()->addMonths(3),
            'annee_scolaire_id' => AnneScolaire::inRandomOrder()->value('id'),
            'est_actif' => false,
            'est_cloture' => false,
        ];
    }

    public function premier(): static
    {
        return $this->state(fn () => [
            'nom' => '1er Trimestre',
            'numero' => 1,
        ]);
    }

    public function deuxieme(): static
    {
        return $this->state(fn () => [
            'nom' => '2ème Trimestre',
            'numero' => 2,
        ]);
    }

    public function troisieme(): static
    {
        return $this->state(fn () => [
            'nom' => '3ème Trimestre',
            'numero' => 3,
        ]);
    }
}
