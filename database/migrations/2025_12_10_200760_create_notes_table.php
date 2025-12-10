<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notes', function (Blueprint $table) {
            $table->id();
            
            // Relations
            $table->foreignId('eleve_id')->constrained('eleves')->cascadeOnDelete();
            $table->foreignId('matiere_id')->constrained('matieres')->cascadeOnDelete();
            $table->foreignId('classe_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('evaluation_id')->nullable()->constrained('evaluations')->nullOnDelete();
            $table->foreignId('professeur_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('trimestre_id')->constrained('trimestres')->cascadeOnDelete();
            $table->foreignId('annee_scolaire_id')->constrained('annee_scolaires')->cascadeOnDelete();
            
            // Données de la note
            $table->decimal('valeur', 5, 2); // Ex: 15.50/20
            $table->decimal('note_sur', 5, 2)->default(20); // Par défaut sur 20
            $table->decimal('coefficient', 5, 2)->default(1.00);
            $table->enum('type', ['devoir', 'composition', 'oral', 'pratique', 'projet', 'autre']);
            $table->date('date_evaluation');
            $table->date('date_saisie')->default(now());
            
            // Pondération et calculs
            $table->decimal('note_ponderee', 5, 2)->virtualAs('valeur * coefficient');
            $table->decimal('pourcentage', 5, 2)->virtualAs('(valeur / note_sur) * 100');
            
            // Appréciation et commentaires
            $table->string('appreciation', 50)->nullable(); // Excellent, Bien, etc.
            $table->text('commentaire')->nullable();
            $table->text('remarques')->nullable();
            
            // Validation et publication
            $table->boolean('est_validee')->default(false);
            $table->boolean('est_publiee')->default(false);
            $table->timestamp('date_validation')->nullable();
            $table->foreignId('valide_par')->nullable()->constrained('users')->nullOnDelete();
            
            // Rattrapage et absences
            $table->boolean('est_rattrapage')->default(false);
            $table->foreignId('note_rattrapee_id')->nullable()->constrained('notes')->nullOnDelete();
            $table->boolean('absence_justifiee')->default(false);
            $table->string('motif_absence', 100)->nullable();
            
            // Exclusion de moyenne
            $table->boolean('exclue_moyenne')->default(false);
            $table->string('raison_exclusion', 200)->nullable();
            
            // Statistiques
            $table->integer('rang_classe')->nullable();
            $table->decimal('moyenne_classe', 5, 2)->nullable();
            $table->decimal('moyenne_max', 5, 2)->nullable();
            $table->decimal('moyenne_min', 5, 2)->nullable();
            
            // Système
            $table->uuid('ref')->unique();
            $table->boolean('est_archived')->default(false);
            $table->json('historique_modifications')->nullable(); // Pour suivre les modifications
            $table->text('justification_modification')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index pour les performances
            $table->index(['eleve_id', 'matiere_id', 'trimestre_id']);
            $table->index(['classe_id', 'date_evaluation']);
            $table->index(['est_validee', 'est_publiee']);
            $table->index('type');
            $table->index('date_evaluation');
            $table->index(['annee_scolaire_id', 'trimestre_id']);
            
            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};