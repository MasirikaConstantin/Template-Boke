<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Paiement extends Model
{
    /** @use HasFactory<\Database\Factories\PaiementFactory> */
    use HasFactory, HasLogs, SoftDeletes;
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

    // Appel du boot des traits
    static::bootHasLogs();

    static::creating(function ($paiement) {
        $paiement->ref = (string) \Illuminate\Support\Str::uuid();
    });
    static::created(function ($paiement) {
        if (! $paiement->reference) {
            $year = now()->year;

            $lastNumber = Paiement::withTrashed()
                ->whereYear('created_at', $year)
                ->where('id', '<', $paiement->id)
                ->count();

            $paiement->updateQuietly([
                'reference' => 'PAY-' . $year . '-' . str_pad($lastNumber + 1, 6, '0', STR_PAD_LEFT),
            ]);
        }
    });
}
public function getNomCompletAttribute()
{
    $eleveNom = $this->eleve ? $this->eleve->nom_complet : 'Non spécifié';
    return "Paiement #{$this->reference} - {$eleveNom}";
}
    public function eleve()
    {
        return $this->belongsTo(Eleve::class);
    }
    public function tranche()
    {
        return $this->belongsTo(Tranche::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function historique_paiements()
    {
        return $this->hasMany(HistoriquePaiement::class);
    }

    
}
