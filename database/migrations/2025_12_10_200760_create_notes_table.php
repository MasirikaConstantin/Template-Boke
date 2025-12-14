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

            $table->foreignId('eleve_id')->constrained()->cascadeOnDelete();
            $table->foreignId('matiere_id')->constrained()->cascadeOnDelete();
            $table->foreignId('classe_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evaluation_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('professeur_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('trimestre_id')->constrained()->cascadeOnDelete();
            $table->foreignId('annee_scolaire_id')->constrained()->cascadeOnDelete();

            $table->decimal('valeur', 5, 2);
            $table->decimal('note_sur', 5, 2)->default(20);
            $table->decimal('coefficient', 5, 2)->default(1.00);
            $table->enum('type', ['devoir', 'composition', 'oral', 'pratique', 'projet', 'autre']);
            $table->date('date_evaluation');
            $table->date('date_saisie')->useCurrent();

            $table->string('appreciation', 50)->nullable();
            $table->text('commentaire')->nullable();
            $table->text('remarques')->nullable();

            $table->boolean('est_validee')->default(false);
            $table->boolean('est_publiee')->default(false);
            $table->timestamp('date_validation')->nullable();
            $table->foreignId('valide_par')->nullable()->constrained('users')->nullOnDelete();

            $table->boolean('est_rattrapage')->default(false);
            $table->foreignId('note_rattrapee_id')->nullable()->constrained('notes')->nullOnDelete();
            $table->boolean('absence_justifiee')->default(false);
            $table->string('motif_absence', 100)->nullable();

            $table->boolean('exclue_moyenne')->default(false);
            $table->string('raison_exclusion', 200)->nullable();

            $table->integer('rang_classe')->nullable();
            $table->decimal('moyenne_classe', 5, 2)->nullable();
            $table->decimal('moyenne_max', 5, 2)->nullable();
            $table->decimal('moyenne_min', 5, 2)->nullable();

            $table->uuid('ref')->unique();
            $table->boolean('est_archived')->default(false);
            $table->json('historique_modifications')->nullable();
            $table->text('justification_modification')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['eleve_id', 'matiere_id', 'trimestre_id']);
            $table->index(['classe_id', 'date_evaluation']);
            $table->index(['est_validee', 'est_publiee']);
            $table->index(['annee_scolaire_id', 'trimestre_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
