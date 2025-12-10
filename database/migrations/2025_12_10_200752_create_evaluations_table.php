<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
    $table->id();
    $table->string('nom'); // Ex: Devoir 1, Composition trimestrielle
    $table->string('type'); // Ex: devoir, composition, oral
    $table->decimal('coefficient', 5, 2)->default(1.00);
    $table->decimal('bareme', 5, 2)->default(20.00); // Note sur combien
    $table->date('date_evaluation');
    $table->time('heure_debut')->nullable();
    $table->time('heure_fin')->nullable();
    $table->foreignId('matiere_id')->constrained('matieres')->cascadeOnDelete();
    $table->foreignId('classe_id')->constrained('classes')->cascadeOnDelete();
    $table->foreignId('trimestre_id')->constrained('trimestres')->cascadeOnDelete();
    $table->text('description')->nullable();
    $table->json('competences_evaluees')->nullable(); // Compétences évaluées
    $table->boolean('est_obligatoire')->default(true);
    $table->boolean('est_terminee')->default(false);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
