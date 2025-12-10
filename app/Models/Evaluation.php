<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasLogs;
    
    protected $fillable = ['nom', 'type', 'coefficient', 'bareme', 'date_evaluation', 'heure_debut', 'heure_fin', 'matiere_id', 'classe_id', 'trimestre_id', 'description', 'competences_evaluees', 'est_obligatoire', 'est_terminee'];
    
    protected $casts = [
        'competences_evaluees' => 'array',
        'date_evaluation' => 'date',
    ];
    
    public function matiere()
    {
        return $this->belongsTo(Matiere::class);
    }
    
    public function classe()
    {
        return $this->belongsTo(Classe::class);
    }
    
    public function trimestre()
    {
        return $this->belongsTo(Trimestre::class);
    }
    
    public function notes()
    {
        return $this->hasMany(Note::class);
    }
}