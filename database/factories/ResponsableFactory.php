<?php

namespace Database\Factories;

use App\Models\Responsable;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ResponsableFactory extends Factory
{
    protected $model = Responsable::class;

    public function definition(): array
    {
        $sexe = $this->faker->randomElement(['M', 'F']);
        $type = $this->faker->randomElement(['pere', 'mere', 'tuteur', 'autre']);

        return [
            'nom' => $this->faker->lastName(),
            'prenom' => $this->faker->firstName($sexe === 'M' ? 'male' : 'female'),

            'type_responsable' => $type,

            'cin' => $this->faker->boolean(60)
    ? $this->faker->unique()->numerify('###########')
    : null,


            'date_naissance' => $this->faker->optional()->dateTimeBetween('-70 years', '-25 years'),

            'lieu_naissance' => $this->faker->optional()->city(),

            'sexe' => $sexe,

            'profession' => $this->faker->optional()->jobTitle(),

            'entreprise' => $this->faker->optional()->company(),

            'poste' => $this->faker->optional()->jobTitle(),

            'revenu_mensuel' => $this->faker->optional()->numberBetween(200_000, 5_000_000),

            // Coordonnées
            'adresse' => $this->faker->optional()->address(),
            'ville' => $this->faker->optional()->city(),
            'pays' => 'RDC',
            'telephone_1' => $this->faker->optional()->phoneNumber(),
            'telephone_2' => $this->faker->optional()->phoneNumber(),
            'email' => $this->faker->optional()->safeEmail(),


            // Infos supplémentaires
            'situation_matrimoniale' => $this->faker->optional()->randomElement([
                'marie',
                'celibataire',
                'divorce',
                'veuf',
            ]),

            'niveau_etude' => $this->faker->optional()->randomElement([
                'primaire',
                'secondaire',
                'universitaire',
                'aucun',
            ]),

            'observations' => $this->faker->optional()->sentence(12),

            // Auth (si utilisé)
            'password' => null,
            'remember_token' => null,
            'email_verified_at' => null,

            // Système
            'ref' => Str::uuid(),

            'created_by' => User::inRandomOrder()->value('id'),
            'updated_by' => null,
        ];
    }

    /* ===================== STATES UTILES ===================== */

    /**
     * Responsable père
     */
    public function pere(): static
    {
        return $this->state(fn () => [
            'type_responsable' => 'pere',
            'sexe' => 'M',
        ]);
    }

    /**
     * Responsable mère
     */
    public function mere(): static
    {
        return $this->state(fn () => [
            'type_responsable' => 'mere',
            'sexe' => 'F',
        ]);
    }

    /**
     * Responsable avec compte utilisateur
     */
    public function avecCompte(): static
    {
        return $this->state(fn () => [
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);
    }
}
