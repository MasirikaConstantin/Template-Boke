<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HistoriquePaiement extends Model
{
    /** @use HasFactory<\Database\Factories\HistoriquePaiementFactory> */
    use HasFactory;

    protected $fillable = [
        'paiement_id',
        'action',
        'details',
        'user_id',
    ];
    
}
