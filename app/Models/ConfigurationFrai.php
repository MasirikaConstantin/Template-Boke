<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ConfigurationFrai extends Model
{
    /** @use HasFactory<\Database\Factories\ConfigurationFraiFactory> */
    use HasFactory;
    protected $fillable = [
        'annee_scolaire',
        'nom_frais',
        'montant_total',
        'est_actif',
        'ref',
    ];
    protected static function boot()
    {
        parent::boot(); 
        static::creating(function ($configurationFrai) {
            $configurationFrai->ref = (string) \Illuminate\Support\Str::uuid();
        });
    }
}
