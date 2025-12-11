<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Budget extends Model
{
    use SoftDeletes, HasFactory, HasLogs;
    protected $fillable = [
        'annee',
        'mois',
        'montant_alloue',
        'montant_depense',
        'description',
        'est_actif',
        'ref',
    ];

    protected $casts = [
        'montant_alloue' => 'decimal:2',
        'montant_depense' => 'decimal:2',
        'est_actif' => 'boolean',
    ];
protected $guarded = ['montant_restant'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($budget) {
            if (empty($budget->ref)) {
                $budget->ref = \Illuminate\Support\Str::uuid();
            }
        });

       
    }

    public function depenses(): HasMany
    {
        return $this->hasMany(Depense::class);
    }

    public function getMontantRestantAttribute()
    {
        return $this->montant_alloue - $this->montant_depense;
    }

    public function getPourcentageUtiliseAttribute()
    {
        if ($this->montant_alloue <= 0) {
            return 0;
        }
        return ($this->montant_depense / $this->montant_alloue) * 100;
    }

    public function getEstDepasseAttribute()
    {
        return $this->montant_depense > $this->montant_alloue;
    }

    public function getNomCompletAttribute()
    {
        return ucfirst($this->mois) . ' ' . $this->annee;
    }

    public function scopeActif($query)
    {
        return $query->where('est_actif', true);
    }

    public function scopePourMoisEnCours($query)
    {
        return $query->where('mois', strtolower(now()->monthName))
                    ->where('annee', now()->year);
    }
}