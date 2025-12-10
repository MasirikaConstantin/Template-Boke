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
        Schema::create('trimestres', function (Blueprint $table) {
    $table->id();
    $table->string('nom'); // Ex: 1er Trimestre, 2ème Trimestre
    $table->integer('numero'); // 1, 2, 3
    $table->date('date_debut');
    $table->date('date_fin');
    $table->foreignId('annee_scolaire_id')->constrained('annee_scolaires')->cascadeOnDelete();
    $table->boolean('est_actif')->default(false);
    $table->boolean('est_cloture')->default(false);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trimestres');
    }
};
