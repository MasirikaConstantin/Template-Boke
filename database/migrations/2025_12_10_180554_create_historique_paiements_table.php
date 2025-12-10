<?php

use App\Models\Paiement;
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
        Schema::create('historique_paiements', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Paiement::class)->constrained();
            $table->string('action'); // création, modification, annulation
            $table->text('details')->nullable();
            $table->foreignIdFor(User::class)->constrained();
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
        Schema::dropIfExists('historique_paiements');
    }
};
