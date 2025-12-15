<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professeurs', function (Blueprint $table) {
            $table->id();
            $table->string('matricule')->unique()->nullable();
            $table->string('nom');
            $table->string('prenom');
            $table->date('date_naissance')->nullable();
            $table->enum('sexe', ['M', 'F'])->default('M');
            $table->string('lieu_naissance')->nullable();
            $table->string('nationalite')->default('Congolaise DRC');
            $table->string('adresse')->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable()->unique();
            
            // Informations professionnelles
            $table->enum('statut', ['actif', 'suspendu', 'inactif', 'retraite'])->default('actif');
            $table->enum('type_contrat', ['cdi', 'cdd', 'vacataire', 'stagiare'])->default('cdi');
            $table->date('date_embauche')->default(now());
            $table->date('date_fin_contrat')->nullable();
            $table->decimal('salaire_base', 10, 2)->nullable();
            $table->string('numero_cnss')->nullable();
            $table->string('numero_compte_bancaire')->nullable();
            $table->string('nom_banque')->nullable();
            
            // Qualifications académiques
            $table->enum('niveau_etude', ['licence', 'master', 'doctorat', 'autre'])->default('licence');
            $table->string('diplome')->nullable();
            $table->string('specialite')->nullable();
            $table->string('etablissement')->nullable();
            $table->integer('annee_obtention')->nullable();
            
            // Matières enseignées (JSON)
            $table->json('matieres')->nullable();
            
            // Classe (professeur principal)
            $table->foreignId('classe_id')->nullable()->constrained('classes')->nullOnDelete();
            
            // Documents
            $table->string('photo')->nullable();
            $table->string('cv')->nullable();
            $table->string('diplome_copie')->nullable();
            $table->string('contrat')->nullable();
            
            // Système
            $table->uuid('ref')->unique();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index
            $table->index(['nom', 'prenom']);
            $table->index('matricule');
            $table->index('statut');
            $table->index('classe_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professeurs');
    }
};