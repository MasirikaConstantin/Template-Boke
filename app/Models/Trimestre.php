<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trimestre extends Model
{
    protected $fillable = ['nom', 'numero', 'date_debut', 'date_fin', 'annee_scolaire_id', 'est_actif', 'est_cloture'];
    
    public function anneeScolaire()
    {
        return $this->belongsTo(AnneScolaire::class);
    }
    
    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}