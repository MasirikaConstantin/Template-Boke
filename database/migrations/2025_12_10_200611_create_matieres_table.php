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
        Schema::create('matieres', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // Ex: MATH, FRAN, PHY
            $table->string('nom');
            $table->string('nom_complet')->nullable();
            $table->decimal('coefficient', 5, 2)->default(1.00);
            $table->enum('niveau', ['primaire', 'college', 'lycee'])->default('college');
            $table->enum('type', ['obligatoire', 'optionnelle', 'facultative'])->default('obligatoire');
            $table->integer('volume_horaire')->nullable(); // En heures
            $table->integer('ordre_affichage')->default(0);
            $table->text('description')->nullable();
            $table->boolean('est_active')->default(true);
            $table->foreignId('professeur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matieres');
    }
};
