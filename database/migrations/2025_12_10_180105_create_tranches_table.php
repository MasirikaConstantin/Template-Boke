<?php

use App\Models\ConfigurationFrai;
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
        Schema::create('tranches', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(ConfigurationFrai::class)->constrained()->cascadeOnDelete();
            $table->string('nom_tranche');
            $table->decimal('montant', 10, 2);
            $table->date('date_limite');
            $table->integer('ordre');
            $table->uuid('ref')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tranches');
    }
};
