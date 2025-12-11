<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprobationDepense extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes, \Illuminate\Database\Eloquent\Factories\HasFactory, \App\Traits\HasLogs;
    protected $fillable = [
        'depense_id',
        'user_id',
        'decision',
        'commentaire',
    ];


    protected static function boot()
    {
        parent::boot();

        static::creating(function ($appro) {
            if (empty($budget->ref)) {
                $appro->ref = \Illuminate\Support\Str::uuid();
            }
        });

    }
    public function depense(): BelongsTo
    {
        return $this->belongsTo(Depense::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getDecisionLabelAttribute()
    {
        $labels = [
            'approuve' => 'Approuvé',
            'rejete' => 'Rejeté',
            'modifie' => 'Modifié',
        ];

        return $labels[$this->decision] ?? 'Inconnu';
    }
}