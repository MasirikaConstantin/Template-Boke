<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasLogs;

class Eleve extends Model
{
    use SoftDeletes, HasLogs;

    protected $fillable = [
        // Identité
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
        
        // Parents/Tuteurs
        'nom_pere',
        'profession_pere',
        'telephone_pere',
        'nom_mere',
        'profession_mere',
        'telephone_mere',
        'nom_tuteur',
        'profession_tuteur',
        'telephone_tuteur',
        'adresse_tuteur',
        
        // Scolarité
        'classe_id',
        'statut',
        'date_inscription',
        'date_sortie',
        'motif_sortie',
        
        // Santé
        'antecedents_medicaux',
        'groupe_sanguin',
        'allergies',
        'medecin_traitant',
        'telephone_medecin',
        
        // Transport
        'moyen_transport',
        'nom_transporteur',
        'telephone_transporteur',
        
        // Académique
        'derniere_ecole',
        'derniere_classe',
        'moyenne_generale',
        'rang_classe',
        'observations',
        
        // Documents
        'photo',
        'certificat_naissance',
        'bulletin_precedent',
        'certificat_medical',
        'autorisation_parentale',
        
        // Système
        'ref',
        'redoublant',
        'annee_redoublement',
        'historique_classes',
        'historique_notes',
        
        // Utilisateurs
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'date_inscription' => 'date',
        'date_sortie' => 'date',
        'moyenne_generale' => 'decimal:2',
        'redoublant' => 'boolean',
        'historique_classes' => 'array',
        'historique_notes' => 'array',
    ];

    protected $appends = [
        'nom_complet',
        'age',
        'statut_label',
        'sexe_label',
    ];

    // Relations
    public function classe(): BelongsTo
    {
        return $this->belongsTo(Classe::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class);
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class);
    }

    // Accessors
    public function getNomCompletAttribute(): string
    {
        return $this->nom . ' ' . $this->prenom;
    }

    public function getAgeAttribute(): int
    {
        return now()->diffInYears($this->date_naissance);
    }

    public function getStatutLabelAttribute(): string
{
    $statut = $this->statut ?? '';

    $statuts = [
        'actif' => 'Actif',
        'inactif' => 'Inactif',
        'transfere' => 'Transféré',
        'exclus' => 'Exclus',
        'diplome' => 'Diplômé',
    ];

    return $statuts[$statut] ?? ucfirst($statut) ?: 'Non défini';
}


    public function getSexeLabelAttribute(): string
    {
        return $this->sexe === 'M' ? 'Masculin' : 'Féminin';
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photo) {
            // Avatar par défaut basé sur le sexe
            return $this->sexe === 'M' 
                ? 'https://ui-avatars.com/api/?name=' . urlencode($this->nom_complet) . '&background=3b82f6&color=fff'
                : 'https://ui-avatars.com/api/?name=' . urlencode($this->nom_complet) . '&background=ec4899&color=fff';
        }
        
        return asset('storage/' . $this->photo);
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->statut === 'actif';
    }

    public function getCanBeDeletedAttribute(): bool
    {
        // Un élève ne peut être supprimé que s'il n'a pas de notes ou de paiements
        return $this->notes()->count() === 0 && $this->paiements()->count() === 0;
    }

    // Scopes
    public function scopeActif($query)
    {
        return $query->where('statut', 'actif');
    }

    public function scopeInactif($query)
    {
        return $query->where('statut', 'inactif');
    }

    public function scopeByClasse($query, $classeId)
    {
        return $query->where('classe_id', $classeId);
    }

    public function scopeBySexe($query, $sexe)
    {
        return $query->where('sexe', $sexe);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('nom', 'like', "%{$search}%")
                    ->orWhere('prenom', 'like', "%{$search}%")
                    ->orWhere('matricule', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
    }

    public function scopeRedoublants($query)
    {
        return $query->where('redoublant', true);
    }

    public function scopeNewThisYear($query)
    {
        return $query->whereYear('date_inscription', now()->year);
    }

    // Méthodes
    public function genererMatricule(): void
    {
        if (!$this->matricule) {
            $annee = now()->format('Y');
            $classe = $this->classe;
            $sequence = Eleve::whereYear('created_at', now()->year)->count() + 1;
            
            $this->matricule = "EL{$annee}-{$classe->ref}-" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
        }
    }

    public function transfererVersClasse(Classe $nouvelleClasse, $dateTransfert = null): void
    {
        // Ajouter à l'historique
        $historique = $this->historique_classes ?? [];
        $historique[] = [
            'classe_id' => $this->classe_id,
            'classe_nom' => $this->classe->nom_complet,
            'date_entree' => $this->date_inscription,
            'date_sortie' => $dateTransfert ?? now(),
        ];
        
        $this->historique_classes = $historique;
        $this->classe_id = $nouvelleClasse->id;
        $this->date_inscription = $dateTransfert ?? now();
        
        // Mettre à jour les compteurs
        $this->classe->decrementerNombreEleves();
        $nouvelleClasse->incrementerNombreEleves();
        
        $this->save();
    }

    public function mettreAJourStatut($nouveauStatut, $motif = null, $date = null): void
    {
        if ($nouveauStatut === 'inactif' || $nouveauStatut === 'transfere' || $nouveauStatut === 'exclus') {
            $this->date_sortie = $date ?? now();
            $this->motif_sortie = $motif;
            
            // Décrémenter le nombre d'élèves de la classe
            if ($this->classe) {
                $this->classe->decrementerNombreEleves();
            }
        }
        
        $this->statut = $nouveauStatut;
        $this->save();
    }

    public function calculerMoyenne(): ?float
    {
        $notes = $this->notes()->with('matiere')->get();
        
        if ($notes->isEmpty()) {
            return null;
        }
        
        $totalCoefficient = 0;
        $totalPoints = 0;
        
        foreach ($notes as $note) {
            $coefficient = $note->matiere->coefficient ?? 1;
            $totalCoefficient += $coefficient;
            $totalPoints += ($note->valeur ?? 0) * $coefficient;
        }
        
        return $totalCoefficient > 0 ? round($totalPoints / $totalCoefficient, 2) : null;
    }

    // Boot
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($eleve) {
            if (empty($eleve->ref)) {
                $eleve->ref = (string) \Illuminate\Support\Str::uuid();
            }
            
            if (auth()->check()) {
                $eleve->created_by = auth()->id();
            }
            
            $eleve->genererMatricule();
        });

        static::updating(function ($eleve) {
            if (auth()->check()) {
                $eleve->updated_by = auth()->id();
            }
        });

        static::created(function ($eleve) {
            // Incrémenter le nombre d'élèves dans la classe
            if ($eleve->classe) {
                $eleve->classe->incrementerNombreEleves();
            }
        });

        static::deleted(function ($eleve) {
            if (!$eleve->isForceDeleting() && $eleve->classe) {
                // Décrémenter le nombre d'élèves dans la classe
                $eleve->classe->decrementerNombreEleves();
            }
        });

        static::restored(function ($eleve) {
            // Incrémenter le nombre d'élèves dans la classe
            if ($eleve->classe) {
                $eleve->classe->incrementerNombreEleves();
            }
        });
    }
}