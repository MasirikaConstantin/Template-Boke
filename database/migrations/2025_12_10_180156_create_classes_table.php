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
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('nom_classe');
            $table->enum('niveau', ['primaire', 'secondaire']);
            $table->string('section')->nullable();
            $table->uuid('ref')->unique();
            $table->foreignId('professeur_principal_id')->nullable()->constrained('users');
            $table->integer('capacite_max')->default(30);
            $table->integer('nombre_eleves')->default(0);
            $table->enum('statut', ['active', 'inactive', 'archived'])->default('active');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['niveau', 'statut']);
            $table->index('ref');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
