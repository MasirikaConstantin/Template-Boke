<?php

namespace Database\Seeders;

use App\Models\Absence;
use App\Models\ApprobationDepense;
use App\Models\Budget;
use App\Models\CategorieDepense;
use App\Models\Classe;
use App\Models\Depense;
use App\Models\Eleve;
use App\Models\EleveResponsable;
use App\Models\Matiere;
use App\Models\Note;
use App\Models\Responsable;
use App\Models\Tranche;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(10)->create();
        

        Eleve::factory()->count(50)->create();

        Tranche::factory()->count(10)->create();
        Classe::factory()->active()->count(15)->create();
        Responsable::factory()->count(10)->create();
        Matiere::factory()->count(10)->create();

        $this->call([
            PaiementSeeder::class,
            HistoriquePaiementSeeder::class,
            AnneScolaireSeeder::class,
            TrimestreEvaluationSeeder::class,
        ]);
        Note::factory()->count(50)->create();
        Absence::factory()->count(40)->create();
        Budget::factory()->count(12)->create();
        CategorieDepense::factory()->count(10)->create();
        Depense::factory()->count(30)->create();
        ApprobationDepense::factory()->count(20)->create();
        EleveResponsable::factory()->count(50)->create();
    }
}
