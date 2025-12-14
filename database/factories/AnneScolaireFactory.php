<?php

namespace Database\Factories;

use App\Models\AnneScolaire;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnneScolaireFactory extends Factory
{
    protected $model = AnneScolaire::class;

    public function definition(): array
    {
        // Année de début entre -5 ans et maintenant
        $anneeDebut = $this->faker->numberBetween(
            now()->year - 5,
            now()->year
        );

        $anneeFin = $anneeDebut + 1;
        $code = $anneeDebut . '-' . $anneeFin;

        return [
            'nom' => $code,
            'code' => $code,

            'date_debut' => now()
                ->setYear($anneeDebut)
                ->setMonth(9)
                ->setDay(1),

            'date_fin' => now()
                ->setYear($anneeFin)
                ->setMonth(6)
                ->setDay(30),

            'est_active' => false,
            'est_cloturee' => false,
        ];
    }

    /* ===================== STATES MÉTIER ===================== */

    /**
     * Année scolaire active
     */
    public function active(): static
    {
        return $this->state(fn () => [
            'est_active' => true,
            'est_cloturee' => false,
        ]);
    }

    /**
     * Année scolaire clôturée
     */
    public function cloturee(): static
    {
        return $this->state(fn () => [
            'est_active' => false,
            'est_cloturee' => true,
        ]);
    }
}
