<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HistoriquePaiement extends Model
{
    /** @use HasFactory<\Database\Factories\HistoriquePaiementFactory> */
    use HasFactory, HasLogs,SoftDeletes;
    protected $table = 'historique_paiements';

    protected $fillable = [
        'paiement_id',
        'action',
        'details',
        'user_id',
    ];

    public function paiement()
    {
        return $this->belongsTo(Paiement::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    protected static function booted()
    {
        static::creating(function ($historiquePaiement) {
            $historiquePaiement->ref = (string) \Illuminate\Support\Str::uuid();
        });

        static::updating(function ($historiquePaiement) {
            // Logique avant la mise à jour d'un historique de paiement
        });

        static::deleting(function ($historiquePaiement) {
            // Logique avant la suppression d'un historique de paiement
        });
    }
}
