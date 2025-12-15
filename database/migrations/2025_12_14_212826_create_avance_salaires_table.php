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
        Schema::create('avance_salaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professeur_id')->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->decimal('montant', 10, 2);
            $table->date('date_avance');
            $table->enum('statut', ['demandee', 'approuvee', 'payee', 'deduite'])
                ->default('demandee');
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
        Schema::dropIfExists('avance_salaires');
    }
};
