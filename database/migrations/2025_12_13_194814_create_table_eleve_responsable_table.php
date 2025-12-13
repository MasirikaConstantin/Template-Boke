<?php

use App\Models\Eleve;
use App\Models\Responsable;
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
        Schema::create('eleve_responsable', function (Blueprint $table) {
            $table->id();
            
            // Clés étrangères
            $table->foreignIdFor(Eleve::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(Responsable::class)->constrained()->cascadeOnDelete();
            
            // Informations spécifiques à la relation
            $table->enum('lien_parental', [
                'pere', 
                'mere', 
                'tuteur_legal', 
                'grand_pere', 
                'grand_mere', 
                'oncle', 
                'tante', 
                'frere', 
                'soeur', 
                'autre'
            ])->default('tuteur_legal');
            
            $table->boolean('est_responsable_financier')->default(true);
            $table->boolean('est_contact_urgence')->default(false);
            $table->boolean('est_autorise_retirer')->default(false); // Pour retirer l'élève de l'école
            $table->integer('ordre_priorite')->default(1); // 1 = premier contact
            
            // Contact d'urgence
            $table->string('telephone_urgence')->nullable();
            $table->string('relation_urgence')->nullable();
            
            $table->timestamps();
            
            // Clé unique pour éviter les doublons
            $table->unique(['eleve_id', 'responsable_id', 'lien_parental'], 'eleve_parent_lien_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('eleve_responsable');
    }
};
