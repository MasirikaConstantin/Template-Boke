<?php

use App\Models\Depense;
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
        Schema::create('approbation_depenses', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Depense::class)->constrained()->cascadeOnDelete();
            $table->foreignIdFor(User::class)->constrained(); // Approbateur
            $table->string('decision'); // 'approuve', 'rejete', 'modifie'
            $table->text('commentaire')->nullable();
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
        Schema::dropIfExists('approbation_depenses');
    }
};
