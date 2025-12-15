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
        Schema::create('charge_horaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professeur_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->integer('heures_prevues');
            $table->string('periode'); // ex: 2025-03
            $table->uuid("ref")->unique();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('charge_horaires');
    }
};
