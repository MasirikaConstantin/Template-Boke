<?php

namespace Database\Seeders;

use App\Models\Matiere;
use Illuminate\Database\Seeder;

class MatiereSeeder extends Seeder
{
    public function run(): void
    {
        if (Matiere::count() > 0) {
            $this->command->info('Matières déjà existantes — seed ignoré');
            return;
        }

        Matiere::factory()->count(15)->create();
    }
}
