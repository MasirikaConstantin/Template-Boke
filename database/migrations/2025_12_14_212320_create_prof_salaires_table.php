<?php

use App\Models\Professeur;
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
        Schema::create('prof_salaires', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Professeur::class)->constrained()->cascadeOnDelete();
            $table->enum('type_salaire', ['horaire', 'mensuel']);
            $table->decimal('taux_horaire', 10, 2)->nullable();
            $table->decimal('salaire_fixe', 10, 2)->nullable();
            $table->softDeletes();
            $table->uuid('ref')->unique();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prof_salaires');
    }
};
