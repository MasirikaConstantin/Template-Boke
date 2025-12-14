<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;

class EleveResponsable extends Pivot
{
    /** @use HasFactory<\Database\Factories\EleveResponsableFactory> */
    use HasFactory;
    protected $table = 'eleve_responsable';
     protected $fillable = [
        'eleve_id',
        'responsable_id',
        'lien_parental',
        'est_responsable_financier',
        'est_contact_urgence',
        'est_autorise_retirer',
        'ordre_priorite',
        'telephone_urgence',
        'relation_urgence',
    ];

    protected $casts = [
        'est_responsable_financier' => 'boolean',
        'est_contact_urgence' => 'boolean',
        'est_autorise_retirer' => 'boolean',
    ];
}
