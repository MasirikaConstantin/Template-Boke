<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Matiere extends Model
{
    use SoftDeletes, HasLogs, HasFactory;
    
    protected $fillable = ['code', 'nom', 'nom_complet', 'coefficient', 'niveau', 'type', 'volume_horaire', 'ordre_affichage', 'description', 'est_active', 'professeur_id'];
    
    public function professeur()
    {
        return $this->belongsTo(User::class);
    }
    
    public function notes()
    {
        return $this->hasMany(Note::class);
    }
    
    public function evaluations()
    {
        return $this->hasMany(Evaluation::class);
    }
}