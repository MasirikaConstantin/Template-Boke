<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;
class PaiementSalaire extends Model
{
    use HasFactory, SoftDeletes, HasLogs;

    protected $table = 'paiement_salaires';

    protected $fillable = [
        'professeur_id',
        'prof_salaire_id',
        'type_paiement',
        'montant',
        'date_paiement',
        'periode',
        'statut',
        'ref',
        'avance_id',
        'heures_travaillees',
        'taux_horaire',
        'salaire_base',
        'avances_deduites',
        'retenues',
        'avance_id',
        'net_a_payer',
    ];

    protected $casts = [
        'montant' => 'decimal:2',
        'date_paiement' => 'date',
        'heures_travaillees' => 'decimal:2',
        'taux_horaire' => 'decimal:2',
        'salaire_base' => 'decimal:2',
        'avances_deduites' => 'decimal:2',
        'retenues' => 'decimal:2',
        'net_a_payer' => 'decimal:2',
    ];

    protected $appends = [
        'statut_label',
        'statut_color',
        'type_paiement_label',
        'formatted_montant',
        'formatted_date',
        'formatted_periode',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
            
            // Calculer le net à payer
            $model->calculerNetAPayer();
        });

        static::created(function ($model) {
            if ($model->statut === 'paye') {
                $model->creerDepense();
                
                // Marquer les avances comme déduites
                if ($model->type_paiement === 'normal') {
                    $model->deduireAvances();
                }
            }
        });

        static::updated(function ($model) {
            if ($model->isDirty('statut') && $model->statut === 'paye') {
                $model->creerDepense();
            }
        });
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function profSalaire()
    {
        return $this->belongsTo(ProfSalaire::class);
    }

    public function avance()
    {
        return $this->belongsTo(AvanceSalaire::class, 'avance_id');
    }

    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopePaye($query)
    {
        return $query->where('statut', 'paye');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('statut', 'en_attente');
    }

    public function scopeByPeriode($query, $periode)
    {
        return $query->where('periode', $periode);
    }

    public function scopeByProfesseur($query, $professeurId)
    {
        return $query->where('professeur_id', $professeurId);
    }

    public function getStatutLabelAttribute()
    {
        $labels = [
            'en_attente' => 'En attente',
            'paye' => 'Payé',
        ];

        return $labels[$this->statut] ?? 'Inconnu';
    }

    public function getStatutColorAttribute()
    {
        $colors = [
            'en_attente' => 'warning',
            'paye' => 'success',
        ];

        return $colors[$this->statut] ?? 'default';
    }

    public function getTypePaiementLabelAttribute()
    {
        $labels = [
            'normal' => 'Salaire normal',
            'avance' => 'Avance',
            'regularisation' => 'Régularisation',
        ];

        return $labels[$this->type_paiement] ?? 'Inconnu';
    }

    public function getFormattedMontantAttribute()
    {
        return number_format($this->montant, 2, ',', ' ') . ' $';
    }

    public function getFormattedDateAttribute()
    {
        return $this->date_paiement->format('d/m/Y');
    }

    public function getFormattedPeriodeAttribute()
    {
        $date = \Carbon\Carbon::createFromFormat('Y-m', $this->periode);
        return $date->format('F Y');
    }

    public function calculerNetAPayer()
    {
        $salaireBase = $this->salaire_base ?? 0;
        $avancesDeduites = $this->avances_deduites ?? 0;
        $retenues = $this->retenues ?? 0;
        
        $netAPayer = $salaireBase - $avancesDeduites - $retenues;
        
        $this->net_a_payer = max(0, $netAPayer);
        $this->montant = $this->net_a_payer;
    }

    public function calculerSalaireBase()
    {
        if (!$this->profSalaire) {
            return 0;
        }

        $profSalaire = $this->profSalaire;

        if ($profSalaire->type_salaire === 'horaire') {
            // Calcul basé sur les heures travaillées
            $heuresTravaillees = $this->heures_travaillees ?? $this->calculerHeuresTravaillees();
            return $heuresTravaillees * $profSalaire->taux_horaire;
        } else {
            // Salaire fixe mensuel
            return $profSalaire->salaire_fixe;
        }
    }

    public function calculerHeuresTravaillees()
    {
        // Récupérer les présences du mois
        $presences = Presence::where('professeur_id', $this->professeur_id)
            ->whereMonth('date', \Carbon\Carbon::parse($this->periode)->month)
            ->whereYear('date', \Carbon\Carbon::parse($this->periode)->year)
            ->whereNotNull('heure_arrivee')
            ->get();

        return $presences->sum('heures_prestées');
    }

    public function calculerAvancesADeduire()
    {
        $avances = AvanceSalaire::where('professeur_id', $this->professeur_id)
            ->where('statut', 'payee')
            ->where('date_avance', '>=', \Carbon\Carbon::parse($this->periode)->startOfMonth())
            ->where('date_avance', '<=', \Carbon\Carbon::parse($this->periode)->endOfMonth())
            ->sum('montant');

        return $avances;
    }

    public function deduireAvances()
    {
        $avances = AvanceSalaire::where('professeur_id', $this->professeur_id)
            ->where('statut', 'payee')
            ->where('date_avance', '>=', \Carbon\Carbon::parse($this->periode)->startOfMonth())
            ->where('date_avance', '<=', \Carbon\Carbon::parse($this->periode)->endOfMonth())
            ->get();

        foreach ($avances as $avance) {
            $avance->deduire();
        }
    }

    public function creerDepense()
    {
        // Récupérer le budget pour les salaires
        $budget = Budget::where('type', 'salaires')->first();
        
        // Récupérer la catégorie pour les salaires
        $categorie = CategorieDepense::where('nom', 'Salaires')->first();

        $libelle = $this->type_paiement === 'normal' 
            ? "Salaire {$this->formatted_periode} - {$this->professeur->name}"
            : "{$this->type_paiement_label} - {$this->professeur->name}";

        $depense = Depense::create([
            'budget_id' => $budget?->id,
            'categorie_depense_id' => $categorie?->id,
            'user_id' => Auth::user()->id,
            'reference' => 'SAL-' . $this->ref,
            'libelle' => $libelle,
            'montant' => $this->montant,
            'mode_paiement' => 'virement',
            'beneficiaire' => $this->professeur->name,
            'description' => $this->getDescriptionDepense(),
            'date_depense' => $this->date_paiement,
            'numero_piece' => "PAIE-{$this->ref}",
            'statut' => 'paye',
            'ref' => \Illuminate\Support\Str::uuid(),
        ]);

        return $depense;
    }

    protected function getDescriptionDepense()
    {
        $description = "Paiement {$this->type_paiement_label} pour {$this->professeur->name}\n";
        $description .= "Période: {$this->formatted_periode}\n";
        
        if ($this->type_paiement === 'normal') {
            $description .= "Salaire base: " . number_format($this->salaire_base, 2, ',', ' ') . " $\n";
            if ($this->avances_deduites > 0) {
                $description .= "Avances déduites: " . number_format($this->avances_deduites, 2, ',', ' ') . " $\n";
            }
            if ($this->retenues > 0) {
                $description .= "Retenues: " . number_format($this->retenues, 2, ',', ' ') . " $\n";
            }
        }
        
        $description .= "Net à payer: " . number_format($this->net_a_payer, 2, ',', ' ') . " $";
        
        return $description;
    }
}