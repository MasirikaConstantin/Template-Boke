<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\Eleve;
use App\Models\Matiere;
use App\Models\Classe;
use App\Models\User;
use App\Models\Trimestre;
use App\Models\AnneScolaire;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class NoteFactory extends Factory
{
    protected $model = Note::class;

    public function definition(): array
    {
        // Relations existantes (on ne recrée PAS)
        $eleve = Eleve::inRandomOrder()->first()
            ?? Eleve::factory()->create();

        $classe = $eleve->classe
            ?? Classe::inRandomOrder()->first()
            ?? Classe::factory()->create();

        $matiere = Matiere::inRandomOrder()->first()
            ?? Matiere::factory()->create();

        $professeur = User::inRandomOrder()->first()
            ?? User::factory()->create();

        $annee = AnneScolaire::where('est_active', true)->first()
            ?? AnneScolaire::inRandomOrder()->first()
            ?? AnneScolaire::factory()->create();

        $trimestre = Trimestre::where('annee_scolaire_id', $annee->id)
            ->inRandomOrder()
            ->first()
            ?? Trimestre::factory()->create([
                'annee_scolaire_id' => $annee->id,
            ]);

        $noteSur = 20;
        $valeur = $this->faker->randomFloat(2, 0, $noteSur);
        $coefficient = $this->faker->randomElement([1, 1, 1.5, 2]);

        return [
            'eleve_id' => $eleve->id,
            'matiere_id' => $matiere->id,
            'classe_id' => $classe->id,
            'evaluation_id' => null,
            'professeur_id' => $professeur->id,
            'trimestre_id' => $trimestre->id,
            'annee_scolaire_id' => $annee->id,

            'valeur' => $valeur,
            'note_sur' => $noteSur,
            'coefficient' => $coefficient,
            'type' => $this->faker->randomElement([
                'devoir', 'composition', 'oral', 'pratique', 'projet'
            ]),
            'date_evaluation' => $this->faker->dateTimeBetween(
                $trimestre->date_debut,
                $trimestre->date_fin
            )->format('Y-m-d'),

            'appreciation' => $this->appreciation($valeur, $noteSur),
            'commentaire' => $this->faker->optional(0.4)->sentence(),
            'remarques' => $this->faker->optional(0.2)->sentence(),

            'est_validee' => false,
            'est_publiee' => false,
            'date_validation' => null,
            'valide_par' => null,

            'est_rattrapage' => false,
            'note_rattrapee_id' => null,
            'absence_justifiee' => false,
            'motif_absence' => null,

            'exclue_moyenne' => false,
            'raison_exclusion' => null,

            'rang_classe' => null,
            'moyenne_classe' => null,
            'moyenne_max' => null,
            'moyenne_min' => null,

            'ref' => (string) Str::uuid(),
            'est_archived' => false,
            'historique_modifications' => null,
            'justification_modification' => null,
        ];
    }

    /**
     * État : note validée et publiée
     */
    public function validee(): static
    {
        return $this->state(function () {
            return [
                'est_validee' => true,
                'est_publiee' => true,
                'date_validation' => now(),
                'valide_par' => User::inRandomOrder()->first()?->id,
            ];
        });
    }

    /**
     * État : note de rattrapage
     */
    public function rattrapage(Note $noteOriginale = null): static
    {
        return $this->state(function () use ($noteOriginale) {
            return [
                'est_rattrapage' => true,
                'note_rattrapee_id' => $noteOriginale?->id,
                'commentaire' => 'Note de rattrapage',
            ];
        });
    }

    /**
     * Appréciation automatique
     */
    private function appreciation(float $valeur, float $noteSur): string
    {
        $pourcentage = ($valeur / $noteSur) * 100;

        return match (true) {
            $pourcentage >= 85 => 'Excellent',
            $pourcentage >= 70 => 'Très bien',
            $pourcentage >= 60 => 'Bien',
            $pourcentage >= 50 => 'Assez bien',
            default => 'Insuffisant',
        };
    }
}
