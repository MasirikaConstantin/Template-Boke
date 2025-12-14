<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Responsable extends Model
{
    use SoftDeletes,HasLogs,HasFactory;

    protected $table = 'responsables';

    protected $fillable = [
        'nom',
        'prenom',
        'type_responsable',
        'cin',
        'date_naissance',
        'lieu_naissance',
        'sexe',
        'profession',
        'entreprise',
        'poste',
        'revenu_mensuel',
        'adresse',
        'ville',
        'pays',
        'telephone_1',
        'telephone_2',
        'email',
        'situation_matrimoniale',
        'niveau_etude',
        'observations',
        'password',
        'ref',
        'created_by',
        'updated_by',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'revenu_mensuel' => 'decimal:2',
        'email_verified_at' => 'datetime',
    ];
    protected $appends = ['nom_complet','nombre_eleves_actifs'];

    // Relation many-to-many avec élèves
    public function eleves(): BelongsToMany
    {
        return $this->belongsToMany(Eleve::class, 'eleve_responsable')
                    ->withPivot([
                        'lien_parental',
                        'est_responsable_financier',
                        'est_contact_urgence',
                        'est_autorise_retirer',
                        'ordre_priorite',
                        'telephone_urgence',
                    ])
                    ->withTimestamps();
    }

    // Accessor pour le nom complet
    public function getNomCompletAttribute(): string
    {
        return trim($this->nom . ' ' . $this->prenom);
    }

    // Méthode pour obtenir les élèves dont le responsable est financier
    public function elevesFinanciers()
    {
        return $this->eleves()
            ->wherePivot('est_responsable_financier', true)
            ->get();
    }

    // Méthode pour obtenir le nombre d'élèves actifs
    public function getNombreElevesActifsAttribute()
    {
        return $this->eleves()->where('statut', 'actif')->count();
    }

    // Scope pour les responsables actifs
    public function scopeActif($query)
    {
        return $query->whereHas('eleves', function ($q) {
            $q->where('statut', 'actif');
        });
    }

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($responsable) {
            $responsable->ref = (string) \Illuminate\Support\Str::uuid();
            if(Auth::check()){
                $responsable->created_by = Auth::id();
            }
        });

        static::updating(function ($responsable) {
            if(Auth::check()){
                $responsable->updated_by = Auth::id();
            }
        });
    }
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}