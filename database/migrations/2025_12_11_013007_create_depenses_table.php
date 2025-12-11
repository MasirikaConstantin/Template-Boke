<?php

use App\Models\Budget;
use App\Models\CategorieDepense;
use App\Models\User;
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
        Schema::create('depenses', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Budget::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(CategorieDepense::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class)->constrained(); // Utilisateur qui a effectué la dépense
            $table->string('reference')->unique();
            $table->string('libelle');
            $table->decimal('montant', 10, 2);
            $table->enum('mode_paiement', ['espèce', 'chèque', 'virement', 'carte']);
            $table->string('beneficiaire');
            $table->text('description')->nullable();
            $table->date('date_depense');
            $table->string('numero_piece')->nullable(); // Numéro de facture, reçu, etc.
            $table->string('fichier_joint')->nullable(); // PDF, image de la facture
            $table->enum('statut', ['brouillon', 'en_attente', 'approuve', 'rejete', 'paye'])->default('brouillon');
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
        Schema::dropIfExists('depenses');
    }
};
