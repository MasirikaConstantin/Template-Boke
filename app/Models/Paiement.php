<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    /** @use HasFactory<\Database\Factories\PaiementFactory> */
    use HasFactory;
    protected $fillable = [
        'eleve_id',
        'tranche_id',
        'user_id',
        'reference',
        'montant',
        'mode_paiement',
        'numero_cheque',
        'commentaire',
        'date_paiement',
    ];
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($paiement) {
            $paiement->ref = (string) \Illuminate\Support\Str::uuid();

            HistoriquePaiement::create([
                'paiement_id' => $paiement->id,
                'action' => 'création',
                'details' => 'Paiement créé avec la référence ' . $paiement->reference,
                'user_id' => $paiement->user_id,
            ]);
        });

        static::updating(function ($paiement) {
            HistoriquePaiement::create([
                'paiement_id' => $paiement->id,
                'action' => 'modification',
                'details' => 'Paiement modifié avec la référence ' . $paiement->reference,
                'user_id' => $paiement->user_id,
            ]);
        });

        static::deleting(function ($paiement) {
            HistoriquePaiement::create([
                'paiement_id' => $paiement->id,
                'action' => 'annulation',
                'details' => 'Paiement annulé avec la référence ' . $paiement->reference,
                'user_id' => $paiement->user_id,
            ]);
        });
    }
}
