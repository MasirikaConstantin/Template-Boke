<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Eleve extends Model
{
    use SoftDeletes, HasLogs, HasFactory;

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
        'responsable_principal_id',
        'classe_id',
        'statut',
        'date_inscription',
        'date_sortie',
        'motif_sortie',
        'antecedents_medicaux',
        'groupe_sanguin',
        'allergies',
        'medecin_traitant',
        'telephone_medecin',
        'moyen_transport',
        'nom_transporteur',
        'telephone_transporteur',
        'derniere_ecole',
        'derniere_classe',
        'moyenne_generale',
        'rang_classe',
        'observations',
        'photo',
        'certificat_naissance',
        'bulletin_precedent',
        'certificat_medical',
        'autorisation_parentale',
        'redoublant',
        'annee_redoublement',
        'historique_classes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'date_inscription' => 'date',
        'date_sortie' => 'date',
        'redoublant' => 'boolean',
        'revenu_mensuel' => 'decimal:2',
        'historique_classes' => 'array',
    ];

    protected $appends = [
        'nom_complet',
        'age',
        'statut_label',
        'sexe_label',
    ];
    public function responsables(): BelongsToMany
    {
        return $this->belongsToMany(Responsable::class, 'eleve_responsable')
            ->withPivot([
                'est_responsable_financier',
                'est_contact_urgence',
                'est_autorise_retirer',
                'ordre_priorite',
                'telephone_urgence',
            ])
            ->withTimestamps();
    }
    public function responsablePrincipal(): BelongsTo
    {
        return $this->belongsTo(Responsable::class, 'responsable_principal_id');
    }

    // Accessor pour le nom complet
    public function getNomCompletAttribute(): string
    {
        return trim($this->nom . ' ' . $this->prenom);
    }

    // Méthode pour obtenir le responsable financier
    public function getResponsableFinancierAttribute()
    {
        return $this->responsables()
            ->wherePivot('est_responsable_financier', true)
            ->orderByPivot('ordre_priorite')
            ->first();
    }

    // Méthode pour obtenir les contacts d'urgence
    public function getContactsUrgenceAttribute()
    {
        return $this->responsables()
            ->wherePivot('est_contact_urgence', true)
            ->orderByPivot('ordre_priorite')
            ->get();
    }

    // Méthode pour ajouter un responsable
    public function ajouterResponsable(Responsable $responsable, array $pivotAttributes = [])
    {
        $defaultAttributes = [
            'lien_parental' => 'tuteur_legal',
            'est_responsable_financier' => false,
            'est_contact_urgence' => false,
            'ordre_priorite' => 1,
        ];

        return $this->responsables()->attach($responsable->id, array_merge($defaultAttributes, $pivotAttributes));
    }

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


    public function getAgeAttribute(): ?int
    {
        if (!$this->date_naissance) {
            return null;
        }
        return $this->date_naissance->diffInYears(now(), false);
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

            $this->matricule = "EL{$annee}-" . str_pad($sequence, 4, '0', STR_PAD_LEFT);
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

        

        static::created(function (Eleve $eleve) {

            if (! $eleve->matricule) {
                $year = now()->format('y'); // ex: 25

                // Numéro séquentiel basé sur ID (SAFE)
                $numero = str_pad($eleve->id, 4, '0', STR_PAD_LEFT);

                $eleve->updateQuietly([
                    'matricule' => "ELV-{$year}-{$numero}",
                ]);
            }
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
    public function historiquePaiements()
    {
        return $this->hasMany(Paiement::class);
    }
}
