<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            
            // Relations
            $table->foreignId('eleve_id')->constrained('eleves')->cascadeOnDelete();
            $table->foreignId('classe_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('matiere_id')->nullable()->constrained('matieres')->nullOnDelete();
            $table->foreignId('professeur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('trimestre_id')->constrained('trimestres')->cascadeOnDelete();
            $table->foreignId('annee_scolaire_id')->constrained('annee_scolaires')->cascadeOnDelete();
            
            // Dates
            $table->date('date_absence');
            $table->time('heure_debut')->nullable();
            $table->time('heure_fin')->nullable();
            $table->integer('duree_minutes')->nullable(); // Durée en minutes
            
            // Type et statut
            $table->enum('type', ['absence', 'retard', 'sortie_anticipée']);
            $table->enum('statut', ['justifiée', 'non_justifiée', 'en_attente'])->default('en_attente');
            
            // Motif et justification
            $table->string('motif', 200);
            $table->text('details_motif')->nullable();
            $table->text('justification')->nullable();
            $table->string('piece_justificative')->nullable(); // Chemin vers le fichier
            $table->date('date_justification')->nullable();
            
            // Traitement
            $table->boolean('est_traitee')->default(false);
            $table->foreignId('traite_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('date_traitement')->nullable();
            $table->enum('decision', ['acceptée', 'refusée', 'en_cours'])->nullable();
            $table->text('commentaire_traitement')->nullable();
            
            // Sanctions
            $table->boolean('sanction_appliquee')->default(false);
            $table->enum('type_sanction', ['avertissement', 'retenue', 'exclusion', 'travail', 'autre'])->nullable();
            $table->text('details_sanction')->nullable();
            $table->date('date_sanction')->nullable();
            $table->boolean('sanction_executee')->default(false);
            
            // Notification aux parents
            $table->boolean('parents_notifies')->default(false);
            $table->timestamp('date_notification_parents')->nullable();
            $table->enum('mode_notification', ['sms', 'email', 'appel', 'courrier', 'autre'])->nullable();
            $table->text('reponse_parents')->nullable();
            
            // Impact scolaire
            $table->boolean('impact_cours')->default(true);
            $table->text('consequences_scolaires')->nullable();
            $table->boolean('rattrapage_organise')->default(false);
            $table->date('date_rattrapage')->nullable();
            
            // Système
            $table->uuid('ref')->unique();
            $table->json('historique')->nullable(); // Historique des modifications
            $table->text('notes_internes')->nullable();
            $table->boolean('est_archived')->default(false);
            
            // Création/modification
            $table->foreignId('declare_par')->constrained('users')->cascadeOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index pour les performances
            $table->index(['eleve_id', 'date_absence']);
            $table->index(['classe_id', 'date_absence']);
            $table->index('statut');
            $table->index('type');
            $table->index('est_traitee');
            $table->index('parents_notifies');
            $table->index(['trimestre_id', 'annee_scolaire_id']);
            $table->index('sanction_appliquee');
            
            // Contraintes
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('absences');
    }
};