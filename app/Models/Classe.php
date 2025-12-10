<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Traits\HasLogs;

class Classe extends Model
{
    use SoftDeletes, HasLogs;

    protected $fillable = [
        'nom_classe',
        'niveau',
        'section',
        'ref',
        'professeur_principal_id',
        'capacite_max',
        'nombre_eleves',
        'statut',
        'description',
    ];

    protected $casts = [
        'capacite_max' => 'integer',
        'nombre_eleves' => 'integer',
    ];

    // Relations
    public function professeurPrincipal(): BelongsTo
    {
        return $this->belongsTo(User::class, 'professeur_principal_id');
    }

    public function eleves(): HasMany
    {
        return $this->hasMany(Eleve::class);
    }

    public function cours(): HasMany
    {
        return $this->hasMany(Cours::class);
    }

    // Scopes
    public function scopePrimaire($query)
    {
        return $query->where('niveau', 'primaire');
    }

    public function scopeSecondaire($query)
    {
        return $query->where('niveau', 'secondaire');
    }

    public function scopeActive($query)
    {
        return $query->where('statut', 'active');
    }

    public function scopeSearch($query, $search)
    {
        return $query->where('nom_classe', 'like', "%{$search}%")
                    ->orWhere('section', 'like', "%{$search}%")
                    ->orWhere('ref', 'like', "%{$search}%");
    }

    public function scopeByNiveau($query, $niveau)
    {
        return $query->where('niveau', $niveau);
    }

    public function scopeBySection($query, $section)
    {
        return $query->where('section', $section);
    }

    // Accessors
    public function getNomCompletAttribute()
    {
        if ($this->niveau === 'secondaire' && $this->section) {
            return "{$this->nom_classe} - {$this->section}";
        }
        return $this->nom_classe;
    }

    public function getNiveauLabelAttribute()
    {
        return $this->niveau === 'primaire' ? 'Primaire' : 'Secondaire';
    }

    public function getStatutLabelAttribute()
    {
        $statuts = [
            'active' => 'Active',
            'inactive' => 'Inactive',
            'archived' => 'Archivée',
        ];
        return $statuts[$this->statut] ?? $this->statut;
    }

    public function getStatutColorAttribute()
    {
        $colors = [
            'active' => 'success',
            'inactive' => 'warning',
            'archived' => 'secondary',
        ];
        return $colors[$this->statut] ?? 'default';
    }

    public function getPourcentageOccupationAttribute()
    {
        if ($this->capacite_max === 0) return 0;
        return round(($this->nombre_eleves / $this->capacite_max) * 100, 1);
    }

    public function getIsFullAttribute()
    {
        return $this->nombre_eleves >= $this->capacite_max;
    }

    // Sections fictives pour le secondaire
    public static function getSectionsSecondaire()
    {
        return [
            'A' => 'Section A (Sciences)',
            'B' => 'Section B (Lettres)',
            'C' => 'Section C (Techniques)',
            'D' => 'Section D (Economie)',
            'E' => 'Section E (Arts)',
        ];
    }

    // Méthodes
    public function incrementerNombreEleves()
    {
        $this->increment('nombre_eleves');
        $this->refresh();
    }

    public function decrementerNombreEleves()
    {
        if ($this->nombre_eleves > 0) {
            $this->decrement('nombre_eleves');
            $this->refresh();
        }
    }

    // Génération de référence automatique
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($classe) {
            if (empty($classe->ref)) {
                $classe->ref = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }
}