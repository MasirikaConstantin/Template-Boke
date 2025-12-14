<?php

namespace Database\Factories;

use App\Models\HistoriquePaiement;
use App\Models\Paiement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class HistoriquePaiementFactory extends Factory
{
    protected $model = HistoriquePaiement::class;

    public function definition(): array
    {
        $action = $this->faker->randomElement([
            'creation',
            'modification',
            'annulation',
        ]);

        return [
            // 👉 Paiement existant (OBLIGATOIRE)
            'paiement_id' => Paiement::query()->inRandomOrder()->value('id')
                ?? Paiement::factory(),

            'action' => $action,

            'details' => $this->faker->optional()->sentence(12),

            // 👉 Utilisateur existant (caissier / admin)
            'user_id' => User::query()->inRandomOrder()->value('id')
                ?? User::factory(),

            'ref' => Str::uuid(),
        ];
    }

    /* ===================== STATES MÉTIER ===================== */

    public function creation(): static
    {
        return $this->state(fn () => [
            'action' => 'creation',
            'details' => 'Paiement enregistré',
        ]);
    }

    public function modification(): static
    {
        return $this->state(fn () => [
            'action' => 'modification',
            'details' => 'Montant ou informations modifiés',
        ]);
    }

    public function annulation(): static
    {
        return $this->state(fn () => [
            'action' => 'annulation',
            'details' => 'Paiement annulé',
        ]);
    }
}
