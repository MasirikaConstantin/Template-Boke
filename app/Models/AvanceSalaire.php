<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;

class AvanceSalaire extends Model
{
    use HasFactory, SoftDeletes, HasLogs;

    protected $table = 'avance_salaires';

    protected $fillable = [
        'professeur_id',
        'montant',
        'date_avance',
        'statut',
        'ref',
        'raison_rejet',
        'approuve_par',
        'approuve_le',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_avance' => 'date',
        'approuve_le' => 'datetime',
    ];

    protected $appends = [
        'statut_label',
        'statut_color',
        'formatted_montant',
        'formatted_date',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
        });

        static::created(function ($model) {
            if ($model->statut === 'payee') {
                $model->creerDepense();
            }
        });

        static::updated(function ($model) {
            if ($model->isDirty('statut') && $model->statut === 'payee') {
                $model->creerDepense();
            }
        });
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function approbateur()
    {
        return $this->belongsTo(User::class, 'approuve_par');
    }

    public function paiements()
    {
        return $this->hasMany(PaiementSalaire::class, 'avance_id');
    }

    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeDemandee($query)
    {
        return $query->where('statut', 'demandee');
    }

    public function scopeApprouvee($query)
    {
        return $query->where('statut', 'approuvee');
    }

    public function scopePayee($query)
    {
        return $query->where('statut', 'payee');
    }

    public function scopeDeduite($query)
    {
        return $query->where('statut', 'deduite');
    }

    public function getStatutLabelAttribute()
    {
        $labels = [
            'demandee' => 'Demandée',
            'approuvee' => 'Approuvée',
            'payee' => 'Payée',
            'deduite' => 'Déduite',
        ];

        return $labels[$this->statut] ?? 'Inconnu';
    }

    public function getStatutColorAttribute()
    {
        $colors = [
            'demandee' => 'warning',
            'approuvee' => 'info',
            'payee' => 'success',
            'deduite' => 'secondary',
        ];

        return $colors[$this->statut] ?? 'default';
    }

    public function getFormattedMontantAttribute()
    {
        return number_format($this->montant, 2, ',', ' ') . ' $';
    }

    public function getFormattedDateAttribute()
    {
        return $this->date_avance->format('d/m/Y');
    }

    public function approuver(User $user)
    {
        $this->update([
            'statut' => 'approuvee',
            'approuve_par' => $user->id,
            'approuve_le' => now(),
        ]);
    }

    public function payer()
    {
        $this->update(['statut' => 'payee']);
    }

    public function deduire()
    {
        $this->update(['statut' => 'deduite']);
    }

    public function rejeter($raison)
    {
        $this->update([
            'statut' => 'rejetee',
            'raison_rejet' => $raison,
        ]);
    }

    public function peutEtreApprouvee()
    {
        return $this->statut === 'demandee';
    }

    public function peutEtrePayee()
    {
        return $this->statut === 'approuvee';
    }

    public function peutEtreDeduite()
    {
        return $this->statut === 'payee';
    }

    public function creerDepense()
    {
        // Récupérer le budget pour les salaires
        //$budget = Budget::where('type', 'salaires')->first();
        
        // Récupérer la catégorie pour les avances
        //$categorie = CategorieDepense::where('nom', 'Avances sur salaires')->first();

        $depense = Depense::create([
            //'budget_id' => $budget?->id,
            //'categorie_depense_id' => $categorie?->id,
            'user_id' => Auth::user()->id,
            'reference' => 'AVS-' . $this->ref,
            'libelle' => "Avance sur salaire - {$this->professeur->name}",
            'montant' => $this->montant,
            'mode_paiement' => 'virement', // ou selon configuration
            'beneficiaire' => $this->professeur->nom,
            'description' => "Avance sur salaire approuvée le {$this->approuve_le?->format('d/m/Y')}",
            'date_depense' => $this->date_avance,
            'numero_piece' => "AVANCE-{$this->ref}",
            'statut' => 'paye',
            'ref' => \Illuminate\Support\Str::uuid(),
        ]);

        return $depense;
    }
}