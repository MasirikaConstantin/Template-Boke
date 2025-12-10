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
        Schema::create('configuration_frais', function (Blueprint $table) {
            $table->id();
            $table->string('annee_scolaire');
            $table->string('nom_frais');
            $table->decimal('montant_total', 10, 2);
            $table->boolean('est_actif')->default(true);
            $table->uuid('ref')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuration_frais');
    }
};
