<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eleves', function (Blueprint $table) {
            $table->id();
            $table->string('matricule')->unique();
            $table->string('nom');
            $table->string('prenom');
            $table->date('date_naissance');
            $table->enum('sexe', ['M', 'F']);
            $table->string('lieu_naissance')->nullable();
            $table->string('nationalite')->default('Congolaise DRC');
            $table->string('adresse')->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable()->unique();
            
            // Référence au responsable principal (facultatif)
            $table->foreignId('responsable_principal_id')->nullable()
                  ->constrained('responsables')->nullOnDelete();
            
            // Scolarité
            $table->foreignId('classe_id')->constrained('classes')->cascadeOnDelete();
            $table->enum('statut', ['actif', 'inactif', 'transfere', 'exclus', 'diplome'])->default('actif');
            $table->date('date_inscription')->default(now());
            $table->date('date_sortie')->nullable();
            $table->text('motif_sortie')->nullable();
            
            // Santé
            $table->text('antecedents_medicaux')->nullable();
            $table->string('groupe_sanguin', 5)->nullable();
            $table->text('allergies')->nullable();
            $table->string('medecin_traitant')->nullable();
            $table->string('telephone_medecin')->nullable();
            
            // Transport
            $table->enum('moyen_transport', ['marche', 'bus', 'voiture', 'taxi', 'autre'])->default('marche');
            $table->string('nom_transporteur')->nullable();
            $table->string('telephone_transporteur')->nullable();
            
            // Informations académiques
            $table->string('derniere_ecole')->nullable();
            $table->string('derniere_classe')->nullable();
            $table->decimal('moyenne_generale', 4, 2)->nullable();
            $table->integer('rang_classe')->nullable();
            $table->text('observations')->nullable();
            
            // Documents
            $table->string('photo')->nullable();
            $table->string('certificat_naissance')->nullable();
            $table->string('bulletin_precedent')->nullable();
            $table->string('certificat_medical')->nullable();
            $table->string('autorisation_parentale')->nullable();
            
            // Système
            $table->uuid('ref')->unique();
            $table->boolean('redoublant')->default(false);
            $table->integer('annee_redoublement')->nullable();
            $table->json('historique_classes')->nullable();
            
            // Utilisateur qui a créé/modifié
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index
            $table->index(['nom', 'prenom']);
            $table->index('matricule');
            $table->index('classe_id');
            $table->index('statut');
            $table->index('responsable_principal_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eleves');
    }
};