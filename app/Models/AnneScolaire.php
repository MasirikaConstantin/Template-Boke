<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnneScolaire extends Model
{
    use HasFactory;
 
    protected $table = 'annee_scolaires';
    protected $fillable = ['nom', 'code', 'date_debut', 'date_fin', 'est_active', 'est_cloturee'];
    
    public function trimestres()
    {
        return $this->hasMany(Trimestre::class);
    }
    
    public function notes()
    {
        return $this->hasMany(Note::class);
    }
    
    public function scopeActive($query)
    {
        return $query->where('est_active', true);
    }
}