<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Presence extends Model
{
    /** @use HasFactory<\Database\Factories\PresenceFactory> */
    use HasFactory,SoftDeletes, HasLogs;


    protected $fillable = [
        'professeur_id',
        'date',
        'heure_arrivee',
        'heure_depart',
        'heures_prestées',
        'ref',
    ];

    protected $casts = [
        'date' => 'date',
        'heure_arrivee' => 'datetime:H:i',
        'heure_depart' => 'datetime:H:i',
        'heures_prestées' => 'decimal:2',
    ];

    protected $appends = [
        'statut',
        'statut_label',
        'statut_color',
        'formatted_date',
        'formatted_heures',
        'retard_minutes',
        'is_retard',
        'is_absent',
        'is_present',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->ref = (string) \Illuminate\Support\Str::uuid();
            
            // Calcul automatique des heures prestées si heures définies
            if ($model->heure_arrivee && $model->heure_depart) {
                $arrivee = \Carbon\Carbon::parse($model->heure_arrivee);
                $depart = \Carbon\Carbon::parse($model->heure_depart);
                $model->heures_prestées = $depart->diffInHours($arrivee);
            }
        });

        static::updating(function ($model) {
            // Recalcul des heures prestées si heures modifiées
            if ($model->isDirty(['heure_arrivee', 'heure_depart'])) {
                if ($model->heure_arrivee && $model->heure_depart) {
                    $arrivee = \Carbon\Carbon::parse($model->heure_arrivee);
                    $depart = \Carbon\Carbon::parse($model->heure_depart);
                    $model->heures_prestées = $depart->diffInHours($arrivee);
                } else {
                    $model->heures_prestées = 0;
                }
            }
        });
    }

    public function professeur()
    {
        return $this->belongsTo(Professeur::class);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeToday($query)
    {
        return $query->whereDate('date', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('date', now()->month)
                     ->whereYear('date', now()->year);
    }

    public function scopeByProfesseur($query, $professeurId)
    {
        return $query->where('professeur_id', $professeurId);
    }

    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('date', [$startDate, $endDate]);
    }

    // Accessors
    public function getStatutAttribute()
    {
        if (is_null($this->heure_arrivee) && is_null($this->heure_depart)) {
            return 'absent';
        } elseif ($this->heure_arrivee && is_null($this->heure_depart)) {
            return 'present';
        } else {
            return 'complete';
        }
    }

    public function getStatutLabelAttribute()
    {
        $labels = [
            'absent' => 'Absent',
            'present' => 'Présent',
            'complete' => 'Journée complète',
        ];

        return $labels[$this->statut] ?? 'Inconnu';
    }

    public function getStatutColorAttribute()
    {
        $colors = [
            'absent' => 'destructive',
            'present' => 'warning',
            'complete' => 'success',
        ];

        return $colors[$this->statut] ?? 'default';
    }

    public function getFormattedDateAttribute()
    {
        return $this->date->format('d/m/Y');
    }

    public function getFormattedHeuresAttribute()
    {
        if ($this->heure_arrivee && $this->heure_depart) {
            $arrivee = \Carbon\Carbon::parse($this->heure_arrivee)->format('H:i');
            $depart = \Carbon\Carbon::parse($this->heure_depart)->format('H:i');
            return "{$arrivee} - {$depart}";
        } elseif ($this->heure_arrivee) {
            return \Carbon\Carbon::parse($this->heure_arrivee)->format('H:i');
        }
        return null;
    }

    public function getRetardMinutesAttribute()
    {
        if (!$this->heure_arrivee) {
            return null;
        }

        $heureArrivee = \Carbon\Carbon::parse($this->heure_arrivee);
        $heureReference = \Carbon\Carbon::parse('08:00'); // Heure de référence pour le retard
        return $heureArrivee->diffInMinutes($heureReference, false);
    }

    public function getIsRetardAttribute()
    {
        return $this->retard_minutes > 0;
    }

    public function getIsAbsentAttribute()
    {
        return $this->statut === 'absent';
    }

    public function getIsPresentAttribute()
    {
        return $this->statut !== 'absent';
    }

    public function getTotalHeuresAttribute()
    {
        return $this->heures_prestées ?? 0;
    }
}
