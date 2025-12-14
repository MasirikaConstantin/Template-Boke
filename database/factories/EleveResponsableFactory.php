<?php

namespace Database\Factories;

use App\Models\EleveResponsable;
use App\Models\Eleve;
use App\Models\Responsable;
use Illuminate\Database\Eloquent\Factories\Factory;

class EleveResponsableFactory extends Factory
{
    protected $model = EleveResponsable::class;

    public function definition(): array
    {
        // Récupérer des entités existantes en priorité
        $eleve = Eleve::inRandomOrder()->first()
            ?? Eleve::factory()->create();

        $responsable = Responsable::inRandomOrder()->first()
            ?? Responsable::factory()->create();

        return [
            'eleve_id' => $eleve->id,
            'responsable_id' => $responsable->id,

            'lien_parental' => $this->faker->randomElement([
                'pere',
                'mere',
                'tuteur_legal',
                'grand_pere',
                'grand_mere',
                'oncle',
                'tante',
                'frere',
                'soeur',
                'autre',
            ]),

            'est_responsable_financier' => $this->faker->boolean(70),
            'est_contact_urgence' => $this->faker->boolean(40),
            'est_autorise_retirer' => $this->faker->boolean(30),

            'ordre_priorite' => $this->faker->numberBetween(1, 3),

            'telephone_urgence' => $this->faker->optional(0.5)->phoneNumber(),
            'relation_urgence' => $this->faker->optional(0.5)->randomElement([
                'Père',
                'Mère',
                'Tuteur',
                'Oncle',
                'Tante',
                'Frère',
                'Sœur',
            ]),
        ];
    }

    /**
     * Responsable principal (financier + urgence)
     */
    public function principal(): static
    {
        return $this->state(fn () => [
            'est_responsable_financier' => true,
            'est_contact_urgence' => true,
            'est_autorise_retirer' => true,
            'ordre_priorite' => 1,
        ]);
    }

    /**
     * Contact d'urgence uniquement
     */
    public function urgence(): static
    {
        return $this->state(fn () => [
            'est_contact_urgence' => true,
            'ordre_priorite' => 1,
        ]);
    }

    /**
     * Responsable secondaire
     */
    public function secondaire(): static
    {
        return $this->state(fn () => [
            'est_responsable_financier' => false,
            'est_contact_urgence' => false,
            'ordre_priorite' => 2,
        ]);
    }
}
