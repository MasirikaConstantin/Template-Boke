<?php

namespace Database\Seeders;

use App\Models\Eleve;
use App\Models\Classe;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class EleveSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('fr_FR');

        // Vérifications de sécurité
        $classes = Classe::all();
        $users = User::all();

        if ($classes->isEmpty()) {
            $this->command->warn("Aucune classe trouvée. Seeder Eleves ignoré.");
            return;
        }

        if ($users->isEmpty()) {
            $this->command->warn("Aucun utilisateur trouvé. Seeder Eleves ignoré.");
            return;
        }

        // Générer 10 élèves
        foreach (range(1, 10) as $i) {

            Eleve::create([
                'matricule' => 'ELV-' . strtoupper(Str::random(6)),
                'nom' => $faker->lastName,
                'prenom' => $faker->firstName,
                'date_naissance' => $faker->dateTimeBetween('-18 years', '-6 years'),
                'sexe' => $faker->randomElement(['M', 'F']),
                'lieu_naissance' => $faker->city,
                'nationalite' => 'Congolaise DRC',
                'adresse' => $faker->address,
                'telephone' => $faker->phoneNumber,
                'email' => $faker->unique()->safeEmail,

                // Parents
                'nom_pere' => $faker->name('male'),
                'profession_pere' => $faker->jobTitle,
                'telephone_pere' => $faker->phoneNumber,
                'nom_mere' => $faker->name('female'),
                'profession_mere' => $faker->jobTitle,
                'telephone_mere' => $faker->phoneNumber,

                // Scolarité
                'classe_id' => $classes->random()->id,
                'statut' => 'actif',
                'date_inscription' => $faker->dateTimeBetween('-1 years', 'now'),

                // Santé
                'antecedents_medicaux' => $faker->sentence(6),
                'groupe_sanguin' => $faker->randomElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-']),
                'allergies' => $faker->sentence(4),
                'medecin_traitant' => $faker->name,
                'telephone_medecin' => $faker->phoneNumber,

                // Transport
                'moyen_transport' => $faker->randomElement(['marche', 'bus', 'voiture', 'taxi', 'autre']),
                'nom_transporteur' => $faker->name,
                'telephone_transporteur' => $faker->phoneNumber,

                // Infos académiques
                'derniere_ecole' => $faker->company,
                'derniere_classe' => $faker->randomElement(['5ème', '6ème', '7ème']),
                'moyenne_generale' => $faker->randomFloat(2, 40, 90),
                'rang_classe' => $faker->numberBetween(1, 30),
                'observations' => $faker->sentence(10),

                // Documents
                'photo' => null,
                'certificat_naissance' => null,
                'bulletin_precedent' => null,
                'certificat_medical' => null,
                'autorisation_parentale' => null,

                // Système
                'ref' => Str::uuid(),
                'redoublant' => $faker->boolean(10),
                'annee_redoublement' => $faker->optional()->year,
                'historique_classes' => json_encode([]),
                'historique_notes' => json_encode([]),

                // User
                'created_by' => $users->random()->id,
                'updated_by' => $users->random()->id,
            ]);
        }

        $this->command->info("10 élèves générés avec succès.");
    }
}
