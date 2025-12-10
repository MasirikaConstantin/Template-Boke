<?php

use App\Models\Eleve;
use App\Models\Tranche;
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
        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Eleve::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(Tranche::class)->nullable()->constrained()->nullOnDelete();
            $table->foreignIdFor(User::class)->constrained(); // Utilisateur qui a enregistré
            $table->string('reference')->unique();
            $table->decimal('montant', 10, 2);
            $table->enum('mode_paiement', ['espèce', 'chèque', 'virement', 'mobile_money']);
            $table->string('numero_cheque')->nullable();
            $table->text('commentaire')->nullable();
            $table->date('date_paiement');
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
        Schema::dropIfExists('paiements');
    }
};
