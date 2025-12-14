<?php

namespace Database\Factories;

use App\Models\Eleve;
use App\Models\Classe;
use App\Models\Responsable;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class EleveFactory extends Factory
{
    protected $model = Eleve::class;

    public function definition(): array
    {
        $sexe = $this->faker->randomElement(['M', 'F']);

        // Classe existante prioritaire
        $classe = Classe::inRandomOrder()->first()
            ?? Classe::factory()->create();

        // Responsable principal (optionnel)
        $responsablePrincipal = $this->faker->boolean(70)
            ? Responsable::inRandomOrder()->first()
            : null;

        // Créateur
        $user = User::inRandomOrder()->first()
            ?? User::factory()->create();

        // Date naissance réaliste (6 à 18 ans)
        $dateNaissance = $this->faker->dateTimeBetween('-18 years', '-6 years');

        // Redoublement
        $redoublant = $this->faker->boolean(20);

        return [
            'matricule' => $this->generateMatricule(),

            'nom' => strtoupper($this->faker->lastName()),
            'prenom' => ucfirst($this->faker->firstName(
                $sexe === 'M' ? 'male' : 'female'
            )),

            'date_naissance' => $dateNaissance->format('Y-m-d'),
            'sexe' => $sexe,
            'lieu_naissance' => $this->faker->optional(0.5)->city(),

            'nationalite' => $this->faker->randomElement([
                'Congolaise DRC',
                'Congolaise Brazza',
                'Angolaise',
                'Rwandaise',
                'Burundaise',
            ]),

            'adresse' => $this->faker->optional(0.5)->address(),
            'telephone' => $this->faker->optional(0.6)->phoneNumber(),
            'email' => $this->faker->boolean(40)
                ? $this->faker->unique()->safeEmail()
                : null,


            'responsable_principal_id' => $responsablePrincipal?->id,

            // Scolarité
            'classe_id' => $classe->id,
            'statut' => 'actif',
            'date_inscription' => now()->subDays(
                $this->faker->numberBetween(1, 120)
            ),

            'date_sortie' => null,
            'motif_sortie' => null,

            // Santé
            'antecedents_medicaux' => $this->faker->optional(0.2)->sentence(),
            'groupe_sanguin' => $this->faker->optional(0.3)->randomElement([
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'O+',
            ]),
            'allergies' => $this->faker->optional(0.2)->sentence(),
            'medecin_traitant' => $this->faker->optional(0.2)->name(),
            'telephone_medecin' => $this->faker->optional(0.2)->phoneNumber(),

            // Transport
            'moyen_transport' => $this->faker->randomElement([
                'marche',
                'bus',
                'voiture',
                'taxi',
                'autre',
            ]),
            'nom_transporteur' => $this->faker->optional(0.2)->company(),
            'telephone_transporteur' => $this->faker->optional(0.2)->phoneNumber(),

            // Infos académiques
            'derniere_ecole' => $this->faker->optional(0.3)->company(),
            'derniere_classe' => $this->faker->optional(0.3)->word(),
            'moyenne_generale' => null,
            'rang_classe' => null,
            'observations' => $this->faker->optional(0.3)->sentence(),

            // Documents
            'photo' => null,
            'certificat_naissance' => null,
            'bulletin_precedent' => null,
            'certificat_medical' => null,
            'autorisation_parentale' => null,

            // Système
            'ref' => (string) Str::uuid(),
            'redoublant' => $redoublant,
            'annee_redoublement' => $redoublant
                ? now()->year - 1
                : null,
            'historique_classes' => null,

            'created_by' => $user->id,
            'updated_by' => null,
        ];
    }

    /**
     * Élève redoublant
     */
    public function redoublant(): static
    {
        return $this->state(fn() => [
            'redoublant' => true,
            'annee_redoublement' => now()->year - 1,
        ]);
    }

    protected function generateMatricule(): string
{
    $mots = [
        'zoka', 'plix', 'naro', 'kavo', 'luma',
        'xiro', 'beko', 'tazu', 'mixo', 'ravo',
        'quex', 'faro', 'lixo', 'daro', 'vexo',
    ];

    $mot1 = $mots[array_rand($mots)];
    $mot2 = $mots[array_rand($mots)];

    $suffixe = strtoupper(substr(bin2hex(random_bytes(2)), 0, 4));

    return strtoupper("ELV-$mot1-$mot2-$suffixe");
}


    /**
     * Élève transféré
     */
    public function transfere(): static
    {
        return $this->state(fn() => [
            'statut' => 'transfere',
            'date_sortie' => now(),
            'motif_sortie' => 'Transfert vers un autre établissement',
        ]);
    }

    /**
     * Élève diplômé
     */
    public function diplome(): static
    {
        return $this->state(fn() => [
            'statut' => 'diplome',
            'date_sortie' => now(),
            'motif_sortie' => 'Fin de cycle',
        ]);
    }
}
