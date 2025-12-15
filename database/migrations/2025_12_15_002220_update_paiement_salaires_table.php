<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paiement_salaires', function (Blueprint $table) {
            $table->foreignId('avance_id')->nullable()->constrained('avance_salaires')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('paiement_salaires', function (Blueprint $table) {
            $table->dropForeign(['avance_id']);
            $table->dropColumn('avance_id');
        });
    }
};