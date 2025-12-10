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
        Schema::create('annee_scolaires', function (Blueprint $table) {
    $table->id();
    $table->string('nom'); // Ex: 2023-2024
    $table->string('code')->unique(); // Ex: 2023-2024
    $table->date('date_debut');
    $table->date('date_fin');
    $table->boolean('est_active')->default(false);
    $table->boolean('est_cloturee')->default(false);
    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('anne_scolaires');
    }
};
