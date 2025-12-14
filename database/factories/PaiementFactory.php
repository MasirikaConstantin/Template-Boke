<?php

namespace Database\Factories;

use App\Models\Paiement;
use App\Models\Eleve;
use App\Models\Tranche;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PaiementFactory extends Factory
{
    protected $model = Paiement::class;

    public function definition(): array
    {
        return [
            // 👉 RÉUTILISER LES ÉLÈVES EXISTANTS
            'eleve_id' => Eleve::query()->inRandomOrder()->value('id'),

            // 👉 RÉUTILISER LES TRANCHES EXISTANTES
            'tranche_id' => Tranche::query()->inRandomOrder()->value('id'),

            // 👉 UTILISATEUR EXISTANT (caissier / admin)
            'user_id' => User::query()->inRandomOrder()->value('id')
                ?? User::factory(),

            'reference' => $this->generateReference(),

            'montant' => $this->faker->numberBetween(20_000, 300_000),

            'mode_paiement' => $mode = $this->faker->randomElement([
                'espèce',
                'mobile_money',
                'virement',
                'chèque',
            ]),

            'numero_cheque' => $mode === 'chèque'
                ? $this->faker->numerify('CHQ-#####')
                : null,

            'commentaire' => $this->faker->optional()->sentence(8),

            'date_paiement' => $this->faker->dateTimeBetween('-6 months', 'now'),

            'ref' => Str::uuid(),
        ];
    }

    /**
     * Génère une référence métier lisible
     * ex: PAY-2025-000123
     */
   protected function generateReference(): string
{
    $mots = [
        'zooka', 'fremix', 'kavro', 'plonex', 'drax',
        'mibra', 'xelto', 'vorix', 'quano', 'lupix',
        'tarko', 'nexia', 'bruko', 'slymo', 'kroza',
    ];

    $mot1 = $mots[array_rand($mots)];
    $mot2 = $mots[array_rand($mots)];

    $suffixe = strtoupper(substr(bin2hex(random_bytes(3)), 0, 5));

    return strtoupper($mot1 . '-' . $mot2 . '-' . $suffixe);
}


    /* ===================== STATES UTILES ===================== */

    public function mobileMoney(): static
    {
        return $this->state(fn () => [
            'mode_paiement' => 'mobile_money',
        ]);
    }

    public function espece(): static
    {
        return $this->state(fn () => [
            'mode_paiement' => 'espèce',
        ]);
    }

    public function cheque(): static
    {
        return $this->state(fn () => [
            'mode_paiement' => 'chèque',
            'numero_cheque' => $this->faker->numerify('CHQ-#####'),
        ]);
    }
}
