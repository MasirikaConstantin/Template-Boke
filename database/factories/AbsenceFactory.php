<?php

namespace Database\Factories;

use App\Models\Absence;
use App\Models\Eleve;
use App\Models\Classe;
use App\Models\Matiere;
use App\Models\User;
use App\Models\Trimestre;
use App\Models\AnneScolaire;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class AbsenceFactory extends Factory
{
    protected $model = Absence::class;

    public function definition(): array
    {
        // Relations existantes (priorité aux données déjà créées)
        $eleve = Eleve::inRandomOrder()->first()
            ?? Eleve::factory()->create();

        $classe = $eleve->classe
            ?? Classe::find($eleve->classe_id)
            ?? Classe::inRandomOrder()->first()
            ?? Classe::factory()->create();

        $annee = AnneScolaire::where('est_active', true)->first()
            ?? AnneScolaire::inRandomOrder()->first()
            ?? AnneScolaire::factory()->create();

        $trimestre = Trimestre::where('annee_scolaire_id', $annee->id)
            ->inRandomOrder()
            ->first()
            ?? Trimestre::factory()->create([
                'annee_scolaire_id' => $annee->id,
            ]);

        $matiere = $this->faker->boolean(70)
            ? Matiere::inRandomOrder()->first()
            : null;

        $professeur = $matiere && $this->faker->boolean(80)
            ? User::inRandomOrder()->first()
            : null;

        $dateAbsence = $this->faker->dateTimeBetween(
            $trimestre->date_debut,
            $trimestre->date_fin
        );

        $heureDebut = $this->faker->boolean(70)
            ? $this->faker->time('H:i')
            : null;

        $heureFin = $heureDebut
            ? $this->faker->time('H:i')
            : null;

        $dureeMinutes = ($heureDebut && $heureFin)
            ? $this->faker->numberBetween(30, 180)
            : null;

        $type = $this->faker->randomElement([
            'absence',
            'retard',
            'sortie_anticipée',
        ]);

        $statut = $this->faker->randomElement([
            'justifiée',
            'non_justifiée',
            'en_attente',
        ]);

        return [
            // Relations
            'eleve_id' => $eleve->id,
            'classe_id' => $classe->id,
            'matiere_id' => $matiere?->id,
            'professeur_id' => $professeur?->id,
            'trimestre_id' => $trimestre->id,
            'annee_scolaire_id' => $annee->id,

            // Dates
            'date_absence' => $dateAbsence->format('Y-m-d'),
            'heure_debut' => $heureDebut,
            'heure_fin' => $heureFin,
            'duree_minutes' => $dureeMinutes,

            // Type et statut
            'type' => $type,
            'statut' => $statut,

            // Motif
            'motif' => $this->faker->sentence(3),
            'details_motif' => $this->faker->optional(0.4)->sentence(),
            'justification' => $statut === 'justifiée'
                ? $this->faker->sentence()
                : null,
            'piece_justificative' => $statut === 'justifiée' && $this->faker->boolean(50)
                ? 'absences/justificatifs/' . Str::random(12) . '.pdf'
                : null,
            'date_justification' => $statut === 'justifiée'
                ? now()
                : null,

            // Traitement
            'est_traitee' => $statut !== 'en_attente',
            'traite_par' => $statut !== 'en_attente'
                ? User::inRandomOrder()->first()?->id
                : null,
            'date_traitement' => $statut !== 'en_attente'
                ? now()
                : null,
            'decision' => $statut === 'justifiée'
                ? 'acceptée'
                : ($statut === 'non_justifiée' ? 'refusée' : 'en_cours'),
            'commentaire_traitement' => $this->faker->optional(0.3)->sentence(),

            // Sanctions
            'sanction_appliquee' => $statut === 'non_justifiée' && $this->faker->boolean(40),
            'type_sanction' => $statut === 'non_justifiée'
                ? $this->faker->optional(0.4)->randomElement([
                    'avertissement',
                    'retenue',
                    'travail',
                    'exclusion',
                ])
                : null,
            'details_sanction' => $this->faker->optional(0.2)->sentence(),
            'date_sanction' => $this->faker->optional(0.3)->date(),
            'sanction_executee' => $this->faker->boolean(50),

            // Notification parents
            'parents_notifies' => $this->faker->boolean(60),
            'date_notification_parents' => $this->faker->boolean(60)
                ? now()
                : null,
            'mode_notification' => $this->faker->boolean(60)
                ? $this->faker->randomElement(['sms', 'email', 'appel'])
                : null,
            'reponse_parents' => $this->faker->optional(0.3)->sentence(),

            // Impact scolaire
            'impact_cours' => $this->faker->boolean(80),
            'consequences_scolaires' => $this->faker->optional(0.3)->sentence(),
            'rattrapage_organise' => $this->faker->boolean(40),
            'date_rattrapage' => $this->faker->optional(0.3)->date(),

            // Système
            'ref' => (string) Str::uuid(),
            'historique' => null,
            'notes_internes' => $this->faker->optional(0.2)->sentence(),
            'est_archived' => false,

            // Création / modification
            'declare_par' => User::inRandomOrder()->first()?->id
                ?? User::factory()->create()->id,
            'updated_by' => null,
        ];
    }

    /**
     * État : absence justifiée
     */
    public function justifiee(): static
    {
        return $this->state(fn () => [
            'statut' => 'justifiée',
            'est_traitee' => true,
            'decision' => 'acceptée',
            'justification' => 'Justification fournie par les parents',
            'date_justification' => now(),
        ]);
    }

    /**
     * État : absence sanctionnée
     */
    public function sanctionnee(): static
    {
        return $this->state(fn () => [
            'statut' => 'non_justifiée',
            'sanction_appliquee' => true,
            'type_sanction' => 'avertissement',
            'decision' => 'refusée',
        ]);
    }
}
