<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Depense extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes, \Illuminate\Database\Eloquent\Factories\HasFactory, \App\Traits\HasLogs;
    protected $fillable = [
        'budget_id',
        'categorie_depense_id',
        'user_id',
        'reference',
        'libelle',
        'montant',
        'mode_paiement',
        'beneficiaire',
        'description',
        'date_depense',
        'numero_piece',
        'fichier_joint',
        'statut',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_depense' => 'date',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($depense) {
            if (empty($depense->reference)) {
                $depense->reference = 'DEP-' . strtoupper(\Illuminate\Support\Str::random(10));
            }
            $depense->ref = (string) \Illuminate\Support\Str::uuid();
        });

    }

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(CategorieDepense::class, 'categorie_depense_id');
    }
    public function categorieDepense(): BelongsTo
    {
        return $this->belongsTo(CategorieDepense::class, 'categorie_depense_id');
    }
    

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function approbations(): HasMany
    {
        return $this->hasMany(ApprobationDepense::class);
    }
public function getNomCompletAttribute()
{
    return "Dépense #{$this->reference} - {$this->libelle}";
}
    public function getStatutBadgeAttribute()
    {
        $badges = [
            'brouillon' => 'secondary',
            'en_attente' => 'warning',
            'approuve' => 'info',
            'rejete' => 'danger',
            'paye' => 'success',
        ];

        return $badges[$this->statut] ?? 'secondary';
    }

    public function getStatutLabelAttribute()
    {
        $labels = [
            'brouillon' => 'Brouillon',
            'en_attente' => 'En attente',
            'approuve' => 'Approuvé',
            'rejete' => 'Rejeté',
            'paye' => 'Payé',
        ];

        return $labels[$this->statut] ?? 'Inconnu';
    }

    public function peutEtreModifiee(): bool
    {
        return in_array($this->statut, ['brouillon', 'en_attente']);
    }

    public function peutEtreSupprimee(): bool
    {
        return in_array($this->statut, ['brouillon', 'en_attente', 'rejete']);
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeApprouvees($query)
    {
        return $query->where('statut', 'approuve');
    }

    public function scopePayees($query)
    {
        return $query->where('statut', 'paye');
    }
}