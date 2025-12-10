<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\HasLogs;

class Absence extends Model
{
    use SoftDeletes, HasLogs;

    protected $fillable = [
        'eleve_id',
        'classe_id',
        'matiere_id',
        'professeur_id',
        'trimestre_id',
        'annee_scolaire_id',
        'date_absence',
        'heure_debut',
        'heure_fin',
        'duree_minutes',
        'type',
        'statut',
        'motif',
        'details_motif',
        'justification',
        'piece_justificative',
        'date_justification',
        'est_traitee',
        'traite_par',
        'date_traitement',
        'decision',
        'commentaire_traitement',
        'sanction_appliquee',
        'type_sanction',
        'details_sanction',
        'date_sanction',
        'sanction_executee',
        'parents_notifies',
        'date_notification_parents',
        'mode_notification',
        'reponse_parents',
        'impact_cours',
        'consequences_scolaires',
        'rattrapage_organise',
        'date_rattrapage',
        'ref',
        'historique',
        'notes_internes',
        'est_archived',
        'declare_par',
        'updated_by',
    ];

    protected $casts = [
        'date_absence' => 'date',
        'date_justification' => 'date',
        'date_traitement' => 'datetime',
        'date_notification_parents' => 'datetime',
        'date_sanction' => 'date',
        'date_rattrapage' => 'date',
        'est_traitee' => 'boolean',
        'sanction_appliquee' => 'boolean',
        'sanction_executee' => 'boolean',
        'parents_notifies' => 'boolean',
        'impact_cours' => 'boolean',
        'rattrapage_organise' => 'boolean',
        'est_archived' => 'boolean',
        'historique' => 'array',
    ];

    protected $appends = [
        'duree_heures',
        'est_justifiee',
        'est_en_retard',
        'est_sortie_anticipée',
        'statut_label',
        'type_label',
        'decision_label',
        'sanction_label',
    ];

    // Relations
    public function eleve(): BelongsTo
    {
        return $this->belongsTo(Eleve::class);
    }

    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function matiere(): BelongsTo
    {
        return $this->belongsTo(Matiere::class);
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
        return $this->belongsTo(AnneeScolaire::class);
    }

    public function declarePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'declare_par');
    }

    public function traitePar(): BelongsTo
    {
        return $this->belongsTo(User::class, 'traite_par');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Accessors
    public function getDureeHeuresAttribute(): ?float
    {
        if (!$this->duree_minutes) return null;
        return round($this->duree_minutes / 60, 2);
    }

    public function getEstJustifieeAttribute(): bool
    {
        return $this->statut === 'justifiée';
    }

    public function getEstEnRetardAttribute(): bool
    {
        return $this->type === 'retard';
    }

    public function getEstSortieAnticipéeAttribute(): bool
    {
        return $this->type === 'sortie_anticipée';
    }

    public function getStatutLabelAttribute(): string
    {
        $labels = [
            'justifiée' => 'Justifiée',
            'non_justifiée' => 'Non justifiée',
            'en_attente' => 'En attente',
        ];
        
        return $labels[$this->statut] ?? $this->statut;
    }

    public function getTypeLabelAttribute(): string
    {
        $labels = [
            'absence' => 'Absence',
            'retard' => 'Retard',
            'sortie_anticipée' => 'Sortie anticipée',
        ];
        
        return $labels[$this->type] ?? $this->type;
    }

    public function getDecisionLabelAttribute(): ?string
    {
        if (!$this->decision) return null;
        
        $labels = [
            'acceptée' => 'Acceptée',
            'refusée' => 'Refusée',
            'en_cours' => 'En cours',
        ];
        
        return $labels[$this->decision] ?? $this->decision;
    }

    public function getSanctionLabelAttribute(): ?string
    {
        if (!$this->type_sanction) return null;
        
        $labels = [
            'avertissement' => 'Avertissement',
            'retenue' => 'Retenue',
            'exclusion' => 'Exclusion',
            'travail' => 'Travail supplémentaire',
            'autre' => 'Autre sanction',
        ];
        
        return $labels[$this->type_sanction] ?? $this->type_sanction;
    }

    public function getCouleurStatutAttribute(): string
    {
        return match($this->statut) {
            'justifiée' => 'success',
            'non_justifiée' => 'danger',
            'en_attente' => 'warning',
            default => 'secondary',
        };
    }

    public function getCouleurTypeAttribute(): string
    {
        return match($this->type) {
            'absence' => 'destructive',
            'retard' => 'warning',
            'sortie_anticipée' => 'info',
            default => 'secondary',
        };
    }

    // Scopes
    public function scopeJustifiees($query)
    {
        return $query->where('statut', 'justifiée');
    }

    public function scopeNonJustifiees($query)
    {
        return $query->where('statut', 'non_justifiée');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeTraitees($query)
    {
        return $query->where('est_traitee', true);
    }

    public function scopeNonTraitees($query)
    {
        return $query->where('est_traitee', false);
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

    public function scopeByProfesseur($query, $professeurId)
    {
        return $query->where('professeur_id', $professeurId);
    }

    public function scopeByTrimestre($query, $trimestreId)
    {
        return $query->where('trimestre_id', $trimestreId);
    }

    public function scopeByAnneeScolaire($query, $anneeScolaireId)
    {
        return $query->where('annee_scolaire_id', $anneeScolaireId);
    }

    public function scopeAbsences($query)
    {
        return $query->where('type', 'absence');
    }

    public function scopeRetards($query)
    {
        return $query->where('type', 'retard');
    }

    public function scopeSortiesAnticipees($query)
    {
        return $query->where('type', 'sortie_anticipée');
    }

    public function scopeParentsNotifies($query)
    {
        return $query->where('parents_notifies', true);
    }

    public function scopeParentsNonNotifies($query)
    {
        return $query->where('parents_notifies', false);
    }

    public function scopeAvecSanctions($query)
    {
        return $query->where('sanction_appliquee', true);
    }

    public function scopeSansSanctions($query)
    {
        return $query->where('sanction_appliquee', false);
    }

    public function scopeBetweenDates($query, $dateDebut, $dateFin)
    {
        return $query->whereBetween('date_absence', [$dateDebut, $dateFin]);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('date_absence', today());
    }

    public function scopeThisWeek($query)
    {
        return $query->whereBetween('date_absence', [
            now()->startOfWeek(),
            now()->endOfWeek()
        ]);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereBetween('date_absence', [
            now()->startOfMonth(),
            now()->endOfMonth()
        ]);
    }

    // Méthodes
    public function justifier(string $justification, string $pieceJustificative = null): void
    {
        $this->update([
            'statut' => 'justifiée',
            'justification' => $justification,
            'piece_justificative' => $pieceJustificative,
            'date_justification' => now(),
            'est_traitee' => true,
            'decision' => 'acceptée',
            'date_traitement' => now(),
        ]);
    }

    public function refuser(string $commentaire): void
    {
        $this->update([
            'statut' => 'non_justifiée',
            'est_traitee' => true,
            'decision' => 'refusée',
            'commentaire_traitement' => $commentaire,
            'date_traitement' => now(),
        ]);
    }

    public function appliquerSanction(string $type, string $details, ?string $date = null): void
    {
        $this->update([
            'sanction_appliquee' => true,
            'type_sanction' => $type,
            'details_sanction' => $details,
            'date_sanction' => $date ?? now(),
            'sanction_executee' => false,
        ]);
    }

    public function marquerSanctionExecutee(): void
    {
        $this->update([
            'sanction_executee' => true,
        ]);
    }

    public function notifierParents(string $mode, string $message = null): void
    {
        $this->update([
            'parents_notifies' => true,
            'mode_notification' => $mode,
            'date_notification_parents' => now(),
        ]);
        
        // Ici, vous pourriez ajouter la logique d'envoi de notification
        // (email, SMS, etc.)
    }

    public function organiserRattrapage(string $date): void
    {
        $this->update([
            'rattrapage_organise' => true,
            'date_rattrapage' => $date,
        ]);
    }

    public function estProlongee(): bool
    {
        return $this->heure_debut && $this->heure_fin && 
               $this->duree_minutes && $this->duree_minutes > 60;
    }

    public function calculerDuree(): void
    {
        if ($this->heure_debut && $this->heure_fin) {
            $debut = \Carbon\Carbon::parse($this->heure_debut);
            $fin = \Carbon\Carbon::parse($this->heure_fin);
            $this->duree_minutes = $debut->diffInMinutes($fin);
        }
    }

    // Boot
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($absence) {
            if (empty($absence->ref)) {
                $absence->ref = (string) \Illuminate\Support\Str::uuid();
            }
            
            if (auth()->check()) {
                $absence->declare_par = auth()->id();
            }
            
            // Remplir automatiquement certaines relations
            if (!$absence->classe_id && $absence->eleve) {
                $absence->classe_id = $absence->eleve->classe_id;
            }
            
            if (!$absence->annee_scolaire_id) {
                $absence->annee_scolaire_id = AnneeScolaire::active()->first()?->id;
            }
            
            if (!$absence->trimestre_id) {
                $absence->trimestre_id = Trimestre::where('est_actif', true)->first()?->id;
            }
            
            // Calculer la durée si les heures sont fournies
            $absence->calculerDuree();
        });

        static::updating(function ($absence) {
            if (auth()->check()) {
                $absence->updated_by = auth()->id();
            }
            
            // Historique des modifications
            if ($absence->isDirty(['statut', 'decision', 'sanction_appliquee'])) {
                $historique = $absence->historique ?? [];
                $historique[] = [
                    'date' => now(),
                    'utilisateur' => auth()->id(),
                    'changement' => [
                        'statut' => [
                            'ancien' => $absence->getOriginal('statut'),
                            'nouveau' => $absence->statut,
                        ],
                        'decision' => [
                            'ancien' => $absence->getOriginal('decision'),
                            'nouveau' => $absence->decision,
                        ],
                        'sanction' => [
                            'ancien' => $absence->getOriginal('sanction_appliquee'),
                            'nouveau' => $absence->sanction_appliquee,
                        ],
                    ],
                ];
                $absence->historique = $historique;
            }
            
            // Recalculer la durée si les heures changent
            if ($absence->isDirty(['heure_debut', 'heure_fin'])) {
                $absence->calculerDuree();
            }
        });

        static::created(function ($absence) {
            // Incrémenter le compteur d'absences de l'élève
            if ($absence->eleve) {
                // Vous pourriez ajouter un champ 'nombre_absences' dans la table élèves
                // $absence->eleve->increment('nombre_absences');
            }
            
            // Log automatique
            $absence->logAction('created', $absence, null, $absence->toArray(),
                "Absence déclarée pour {$absence->eleve->nom_complet}"
            );
        });
    }
}