<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AnneScolaire;
use App\Models\Trimestre;
use App\Models\Evaluation;
use Carbon\Carbon;

class TrimestreEvaluationSeeder extends Seeder
{
    public function run(): void
    {
        $annee = AnneScolaire::where('est_active', true)->first();

        if (! $annee) {
            $this->command->warn('Aucune année scolaire active trouvée');
            return;
        }

        // Cast sécurisé
        $dateDebut = Carbon::parse($annee->date_debut);
        $dateFin   = Carbon::parse($annee->date_fin);

        // Éviter le doublon
        if (Trimestre::where('annee_scolaire_id', $annee->id)->exists()) {
            $this->command->info('Trimestres déjà existants pour cette année');
            return;
        }

        // 1er trimestre
        $t1 = Trimestre::factory()->premier()->create([
            'annee_scolaire_id' => $annee->id,
            'date_debut' => $dateDebut,
            'date_fin' => $dateDebut->copy()->addMonths(3),
            'est_actif' => true,
        ]);

        // 2ème trimestre
        $t2 = Trimestre::factory()->deuxieme()->create([
            'annee_scolaire_id' => $annee->id,
            'date_debut' => $t1->date_fin->copy()->addDay(),
            'date_fin' => $t1->date_fin->copy()->addMonths(3),
        ]);

        // 3ème trimestre
        $t3 = Trimestre::factory()->troisieme()->create([
            'annee_scolaire_id' => $annee->id,
            'date_debut' => $t2->date_fin->copy()->addDay(),
            'date_fin' => $dateFin,
        ]);

        // Évaluations
        foreach ([$t1, $t2, $t3] as $trimestre) {
            Evaluation::factory()
                ->count(8)
                ->create([
                    'trimestre_id' => $trimestre->id,
                ]);
        }

        $this->command->info('Trimestres et évaluations générés avec succès');
    }
}
