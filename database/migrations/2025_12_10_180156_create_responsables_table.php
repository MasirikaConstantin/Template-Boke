<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('responsables', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom');
            $table->enum('type_responsable', ['pere', 'mere', 'tuteur', 'autre'])->default('tuteur');
            $table->string('cin')->unique()->nullable();
            $table->date('date_naissance')->nullable();
            $table->string('lieu_naissance')->nullable();
            $table->enum('sexe', ['M', 'F']);
            $table->string('profession')->nullable();
            $table->string('entreprise')->nullable();
            $table->string('poste')->nullable();
            $table->decimal('revenu_mensuel', 10, 2)->nullable();
            
            // Coordonnées
            $table->string('adresse')->nullable();
            $table->string('ville')->nullable();
            $table->string('pays')->default('RDC');
            $table->string('telephone_1')->nullable();
            $table->string('telephone_2')->nullable();
            $table->string('email')->nullable()->unique();
            
            // Informations supplémentaires
            $table->enum('situation_matrimoniale', ['marie', 'celibataire', 'divorce', 'veuf'])->nullable();
            $table->enum('niveau_etude', ['primaire', 'secondaire', 'universitaire', 'aucun'])->nullable();
            $table->text('observations')->nullable();
            
            // Pour l'authentification si nécessaire
            $table->string('password')->nullable();
            $table->rememberToken();
            $table->timestamp('email_verified_at')->nullable();
            
            // Système
            $table->uuid('ref')->unique();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Index
            $table->index(['nom', 'prenom']);
            $table->index('email');
            $table->index('telephone_1');
            $table->index('type_responsable');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('responsables');
    }
};