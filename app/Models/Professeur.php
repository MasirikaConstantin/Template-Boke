<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;

class Professeur extends Model
{
    /** @use HasFactory<\Database\Factories\ProfesseurFactory> */
    use HasFactory,HasLogs, SoftDeletes;
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($professeur) {
            if (empty($professeur->ref)) {
                $professeur->ref = \Illuminate\Support\Str::uuid();
            }
            if(Auth::check()){
                $professeur->created_by = Auth::user()->id;
            }
        });

        static::updating(function ($professeur){
            if(Auth::check()){
                $professeur->updated_by = Auth::user()->id;
            }
        });

       
    }

    protected $fillable = [
        'matricule',
        'nom',
        'prenom',
        'date_naissance',
        'sexe',
        'lieu_naissance',
        'nationalite',
        'adresse',
        'telephone',
        'email',
        'statut',
        'type_contrat',
        'date_embauche',
        'date_fin_contrat',
        'salaire_base',
        'numero_cnss',
        'numero_compte_bancaire',
        'nom_banque',
        'niveau_etude',
        'diplome',
        'specialite',
        'etablissement',
        'annee_obtention',
        'matieres',
        'classe_id',
        'photo',
        'cv',
        'diplome_copie',
        'contrat',
        'ref',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'date_embauche' => 'date',
        'date_fin_contrat' => 'date',
        'salaire_base' => 'decimal:2',
        'matieres' => 'array',
    ];

    // Relation avec la classe (professeur principal)
    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    // Relation many-to-many avec les classes (cours)
    public function classes(): BelongsToMany
    {
        return $this->belongsToMany(Classe::class, 'classe_professeur')
                    ->withPivot(['matiere_id', 'volume_horaire', 'jours_cours'])
                    ->withTimestamps();
    }

    // Relation avec les matières
    public function matieresEnseignees(): BelongsToMany
    {
        return $this->belongsToMany(Matiere::class, 'professeur_matiere')
                    ->withTimestamps();
    }

    // Accessor pour le nom complet
    public function getNomCompletAttribute(): string
    {
        return trim($this->nom . ' ' . $this->prenom);
    }

    // Accessor pour l'âge
    public function getAgeAttribute(): ?int
    {
        if (!$this->date_naissance) return null;
        
        return now()->diffInYears($this->date_naissance);
    }

    // Accessor pour la durée de service
    public function getAncienneteAttribute(): ?int
    {
        if (!$this->date_embauche) return null;
        
        return now()->diffInYears($this->date_embauche);
    }

    // Méthode pour générer le matricule
    public static function genererMatricule(): string
    {
        $annee = now()->format('y');
        $sequence = self::withTrashed()->count() + 1;
        return sprintf('PROF%s%04d', $annee, $sequence);
    }

    // Scope pour les professeurs actifs
    public function scopeActif($query)
    {
        return $query->where('statut', 'actif');
    }

    // Scope pour les professeurs principaux
    public function scopeProfesseursPrincipaux($query)
    {
        return $query->whereNotNull('classe_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
    public function salaires()
    {
        return $this->hasOne(ProfSalaire::class);
    }
    public static function active()
{
    return self::where('statut', 'actif'); 
}

}
