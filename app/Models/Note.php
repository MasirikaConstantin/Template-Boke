<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Note extends Model
{
    use SoftDeletes, HasLogs, HasFactory;

    protected $fillable = [
        'eleve_id',
        'matiere_id',
        'classe_id',
        'evaluation_id',
        'professeur_id',
        'trimestre_id',
        'annee_scolaire_id',
        'valeur',
        'note_sur',
        'coefficient',
        'type',
        'date_evaluation',
        'date_saisie',
        'appreciation',
        'commentaire',
        'remarques',
        'est_validee',
        'est_publiee',
        'date_validation',
        'valide_par',
        'est_rattrapage',
        'note_rattrapee_id',
        'absence_justifiee',
        'motif_absence',
        'exclue_moyenne',
        'raison_exclusion',
        'rang_classe',
        'moyenne_classe',
        'moyenne_max',
        'moyenne_min',
        'ref',
        'est_archived',
        'historique_modifications',
        'justification_modification',
    ];

    protected $casts = [
        'valeur' => 'decimal:2',
        'note_sur' => 'decimal:2',
        'coefficient' => 'decimal:2',
        'note_ponderee' => 'decimal:2',
        'pourcentage' => 'decimal:2',
        'date_evaluation' => 'date',
        'date_saisie' => 'date',
        'date_validation' => 'datetime',
        'est_validee' => 'boolean',
        'est_publiee' => 'boolean',
        'est_rattrapage' => 'boolean',
        'absence_justifiee' => 'boolean',
        'exclue_moyenne' => 'boolean',
        'est_archived' => 'boolean',
        'historique_modifications' => 'array',
        'moyenne_classe' => 'decimal:2',
        'moyenne_max' => 'decimal:2',
        'moyenne_min' => 'decimal:2',
    ];

    protected $appends = [
        'note_sur_20',
        'note_avec_coefficient',
        'est_valide',
        'est_publie',
        'appreciation_auto',
    ];

    // Relations
    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class);
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(Evaluation::class);
    }

    public function professeur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professeur_id');
    }

    public function trimestre(): BelongsTo
    {
        return $this->belongsTo(Trimestre::class);
    }

    public function anneeScolaire(): BelongsTo
    {
        return $this->belongsTo(AnneScolaire::class);
    }

    public function validePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'valide_par');
    }

    public function noteRattrapee(): BelongsTo
    {
        return $this->belongsTo(Note::class, 'note_rattrapee_id');
    }

    // Accessors
    public function getNoteSur20Attribute(): float
    {
        if ($this->note_sur == 20) {
            return $this->valeur;
        }
        return round(($this->valeur / $this->note_sur) * 20, 2);
    }

    public function getNoteAvecCoefficientAttribute(): float
    {
        return round($this->valeur * $this->coefficient, 2);
    }

    public function getEstValideAttribute(): bool
    {
        return $this->est_validee;
    }

    public function getEstPublieAttribute(): bool
    {
        return $this->est_publiee;
    }

    public function getAppreciationAutoAttribute(): string
    {
        $note = $this->note_sur_20;
        
        if ($note >= 16) return 'Excellent';
        if ($note >= 14) return 'Très Bien';
        if ($note >= 12) return 'Bien';
        if ($note >= 10) return 'Assez Bien';
        if ($note >= 8) return 'Passable';
        if ($note >= 6) return 'Insuffisant';
        return 'Très Faible';
    }

    public function getPourcentageAttribute(): float
    {
        return round(($this->valeur / $this->note_sur) * 100, 2);
    }

    public function getCouleurAttribute(): string
    {
        $note = $this->note_sur_20;
        
        if ($note >= 10) return 'success';
        if ($note >= 8) return 'warning';
        return 'danger';
    }

    // Scopes
    public function scopeValidees($query)
    {
        return $query->where('est_validee', true);
    }

    public function scopePubliees($query)
    {
        return $query->where('est_publiee', true);
    }

    public function scopeByEleve($query, $eleveId)
    {
        return $query->where('eleve_id', $eleveId);
    }

    public function scopeByClasse($query, $classeId)
    {
        return $query->where('classe_id', $classeId);
    }

    public function scopeByMatiere($query, $matiereId)
    {
        return $query->where('matiere_id', $matiereId);
    }

    public function scopeByTrimestre($query, $trimestreId)
    {
        return $query->where('trimestre_id', $trimestreId);
    }

    public function scopeByAnneeScolaire($query, $anneeScolaireId)
    {
        return $query->where('annee_scolaire_id', $anneeScolaireId);
    }

    public function scopeByProfesseur($query, $professeurId)
    {
        return $query->where('professeur_id', $professeurId);
    }

    public function scopeIncluesDansMoyenne($query)
    {
        return $query->where('exclue_moyenne', false);
    }

    public function scopeRattrapages($query)
    {
        return $query->where('est_rattrapage', true);
    }

    // Méthodes
    public function valider(User $validateur, ?string $justification = null): void
    {
        $this->update([
            'est_validee' => true,
            'date_validation' => now(),
            'valide_par' => $validateur->id,
            'justification_modification' => $justification,
        ]);
    }

    public function publier(): void
    {
        $this->update(['est_publiee' => true]);
    }

    public function retirerPublication(): void
    {
        $this->update(['est_publiee' => false]);
    }

    public function exclureDeMoyenne(string $raison): void
    {
        $this->update([
            'exclue_moyenne' => true,
            'raison_exclusion' => $raison,
        ]);
    }

    public function inclureDansMoyenne(): void
    {
        $this->update([
            'exclue_moyenne' => false,
            'raison_exclusion' => null,
        ]);
    }

    public function marquerAbsenceJustifiee(string $motif): void
    {
        $this->update([
            'absence_justifiee' => true,
            'motif_absence' => $motif,
            'valeur' => 0,
        ]);
    }

    public function creerRattrapage(float $nouvelleNote, ?string $commentaire = null): Note
    {
        $rattrapage = $this->replicate();
        $rattrapage->valeur = $nouvelleNote;
        $rattrapage->est_rattrapage = true;
        $rattrapage->note_rattrapee_id = $this->id;
        $rattrapage->commentaire = $commentaire;
        $rattrapage->est_validee = false;
        $rattrapage->est_publiee = false;
        $rattrapage->save();

        return $rattrapage;
    }

    // Boot
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($note) {
            if (empty($note->ref)) {
                $note->ref = (string) \Illuminate\Support\Str::uuid();
            }
            
            if (empty($note->date_saisie)) {
                $note->date_saisie = now();
            }
            
            // Calcul automatique de l'appréciation si vide
            if (empty($note->appreciation)) {
                $note->appreciation = $note->appreciation_auto;
            }
            
            // Remplir automatiquement certaines relations
            if (!$note->classe_id && $note->eleve) {
                $note->classe_id = $note->eleve->classe_id;
            }
            
            if (!$note->annee_scolaire_id) {
                $note->annee_scolaire_id = AnneeScolaire::active()->first()?->id;
            }
        });

        static::updating(function ($note) {
            // Historique des modifications
            if ($note->isDirty('valeur') || $note->isDirty('coefficient')) {
                $historique = $note->historique_modifications ?? [];
                $historique[] = [
                    'date' => now(),
                    'ancienne_valeur' => $note->getOriginal('valeur'),
                    'nouvelle_valeur' => $note->valeur,
                    'ancien_coefficient' => $note->getOriginal('coefficient'),
                    'nouveau_coefficient' => $note->coefficient,
                    'modifie_par' => auth()->id(),
                ];
                $note->historique_modifications = $historique;
            }
            
            // Recalcul de l'appréciation si la note change
            if ($note->isDirty('valeur')) {
                $note->appreciation = $note->appreciation_auto;
            }
        });
    }
}