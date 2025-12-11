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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->string('annee');
            $table->string('mois'); // 'janvier', 'février', etc.
            $table->decimal('montant_alloue', 10, 2);
            $table->decimal('montant_depense', 10, 2)->default(0);
            $table->decimal('montant_restant', 10, 2)->virtualAs('montant_alloue - montant_depense');
            $table->text('description')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->uuid('ref')->unique();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};
