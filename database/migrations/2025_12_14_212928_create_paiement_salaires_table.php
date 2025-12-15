<?php

use App\Models\ProfSalaire;
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
        Schema::create('paiement_salaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professeur_id')->constrained()->cascadeOnDelete();
            $table->foreignIdFor(ProfSalaire::class)->nullable()->constrained()->nullOnDelete();
            $table->enum('type_paiement', ['normal', 'avance', 'regularisation']);
            $table->decimal('montant', 10, 2);
            $table->date('date_paiement');
            $table->string('periode'); // ex: 2025-03
            $table->enum('statut', ['en_attente', 'paye'])->default('paye');

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
        Schema::dropIfExists('paiement_salaires');
    }
};
