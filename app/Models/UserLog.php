<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLog extends Model
{
    /** @use HasFactory<\Database\Factories\UserLogFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'model_type',
        'model_id',
        'old_data',
        'new_data',
        'description',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_data' => 'array',
        'new_data' => 'array',
        'created_at' => 'datetime',
    ];

    // Relations
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function model()
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    // Helper pour formater les données
    public function getFormattedOldDataAttribute()
    {
        return $this->formatData($this->old_data);
    }

    public function getFormattedNewDataAttribute()
    {
        return $this->formatData($this->new_data);
    }

    public function getActionLabelAttribute()
    {
        $labels = [
            'created' => 'Création',
            'updated' => 'Mise à jour',
            'deleted' => 'Suppression',
            'logged_in' => 'Connexion',
            'logged_out' => 'Déconnexion',
            'password_changed' => 'Mot de passe modifié',
            'profile_updated' => 'Profil modifié',
            'status_changed' => 'Statut modifié',
            'role_changed' => 'Rôle modifié',
        ];

        return $labels[$this->action] ?? $this->action;
    }

    public function getActionColorAttribute()
    {
        $colors = [
            'created' => 'success',
            'updated' => 'info',
            'deleted' => 'destructive',
            'logged_in' => 'success',
            'logged_out' => 'secondary',
            'password_changed' => 'warning',
            'profile_updated' => 'info',
            'status_changed' => 'warning',
            'role_changed' => 'warning',
        ];

        return $colors[$this->action] ?? 'default';
    }

    private function formatData($data)
    {
        if (!$data) return null;
        
        if (is_array($data)) {
            return collect($data)->map(function ($value, $key) {
                // Masquer les données sensibles
                if (in_array($key, ['password', 'remember_token'])) {
                    return '******';
                }
                
                // Formater les dates
                if (str_contains($key, '_at') && $value) {
                    try {
                        return \Carbon\Carbon::parse($value)->format('d/m/Y H:i');
                    } catch (\Exception $e) {
                        return $value;
                    }
                }
                
                return $value;
            })->toArray();
        }
        
        return $data;
    }
}
