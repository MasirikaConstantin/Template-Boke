<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tranche extends Model
{
    /** @use HasFactory<\Database\Factories\TrancheFactory> */
    use HasFactory;
    protected $fillable = [
        'nom_tranche',
        'montant',
        'date_echeance',
        'configuration_frai_id',
        'ordre',
        "date_limite",
        'ref',
    ];
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($tranche) {
            $tranche->ref = (string) \Illuminate\Support\Str::uuid();
        });
    }
    public function configuration_frais()
    {
        return $this->belongsTo(ConfigurationFrai::class, 'configuration_frai_id');
    }
}
