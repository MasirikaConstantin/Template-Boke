<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProfSalaire extends Model
{
    /** @use HasFactory<\Database\Factories\ProfSalaireFactory> */
    use HasFactory,HasLogs, SoftDeletes;


    protected $table = 'prof_salaires';

    protected $fillable = [
        'professeur_id',
        'type_salaire',
        'taux_horaire',
        'salaire_fixe',
        'ref',
    ];

    protected $casts = [
        'taux_horaire' => 'decimal:2',
        'salaire_fixe' => 'decimal:2',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
        });
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function getMontantAttribute()
    {
        return $this->type_salaire === 'horaire' 
            ? $this->taux_horaire 
            : $this->salaire_fixe;
    }

    public function getTypeSalaireLabelAttribute()
    {
        return $this->type_salaire === 'horaire' ? 'Horaire' : 'Mensuel';
    }

    public function getFormattedMontantAttribute()
    {
        $montant = $this->montant;
        return $montant ? number_format($montant, 2, ',', ' ') . ' $' : '0,00 $';
    }
}
