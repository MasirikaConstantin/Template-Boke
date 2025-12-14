<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AnneScolaire;
use Carbon\Carbon;

class AnneScolaireSeeder extends Seeder
{
    public function run(): void
    {
        for ($anneeDebut = 2018; $anneeDebut <= 2030; $anneeDebut++) {

            $anneeFin = $anneeDebut + 1;
            $code = "{$anneeDebut}-{$anneeFin}";

            // ⛔ éviter les doublons
            if (AnneScolaire::where('code', $code)->exists()) {
                continue;
            }

            AnneScolaire::create([
                'nom' => $code,
                'code' => $code,

                'date_debut' => Carbon::create($anneeDebut, 9, 1),
                'date_fin'   => Carbon::create($anneeFin, 6, 30),

                // Exemple : année actuelle active
                'est_active'   => $anneeDebut === now()->year,
                'est_cloturee' => $anneeDebut < now()->year,
            ]);
        }
    }
}
