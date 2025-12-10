<?php

namespace App\Traits;

use App\Models\UserLog;

trait HasLogs
{
    /**
     * Boot the trait
     */
    protected static function bootHasLogs()
    {
        static::created(function ($model) {
            $model->logCreation();
        });

        static::updated(function ($model) {
            $model->logUpdate();
        });

        static::deleted(function ($model) {
            $model->logDeletion();
        });

        static::restored(function ($model) {
            $model->logRestoration();
        });
    }

    /**
     * Log relation
     */
    public function logs()
    {
        return $this->morphMany(UserLog::class, 'model');
    }

    /**
     * Get recent logs
     */
    public function recentLogs($limit = 10)
    {
        return $this->logs()->latest()->limit($limit)->get();
    }

    /**
     * Log creation
     */
    public function logCreation()
    {
        if (auth()->check()) {
            $this->createLog('created', [
                'new_data' => $this->getLoggableData(),
                'description' => $this->getCreationDescription(),
            ]);
        }
    }

    /**
     * Log update
     */
    public function logUpdate()
    {
        if (auth()->check()) {
            $changes = $this->getChangedData();
            
            if (!empty($changes)) {
                $this->createLog('updated', [
                    'old_data' => $changes['old'],
                    'new_data' => $changes['new'],
                    'description' => $this->getUpdateDescription($changes),
                ]);
            }
        }
    }

    /**
     * Log deletion
     */
    public function logDeletion()
    {
        if (auth()->check()) {
            $this->createLog('deleted', [
                'old_data' => $this->getLoggableData(),
                'description' => $this->getDeletionDescription(),
            ]);
        }
    }

    /**
     * Log restoration
     */
    public function logRestoration()
    {
        if (auth()->check()) {
            $this->createLog('restored', [
                'new_data' => $this->getLoggableData(),
                'description' => $this->getRestorationDescription(),
            ]);
        }
    }

    /**
     * Create a custom log
     */
    public function logAction($action, $data = [], $description = null)
    {
        if (auth()->check()) {
            $logData = array_merge([
                'action' => $action,
                'description' => $description,
            ], $data);

            $this->createLog($action, $logData);
        }
    }

    /**
     * Create log entry
     */
    protected function createLog($action, $data = [])
    {
        $request = request();
        
        return UserLog::create(array_merge([
            'user_id' => auth()->id(),
            'action' => $action,
            'model_type' => get_class($this),
            'model_id' => $this->id,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->header('User-Agent'),
        ], $data));
    }

    /**
     * Get changed data for logging
     */
    protected function getChangedData()
    {
        $changes = [];
        $original = $this->getOriginal();
        $dirty = $this->getDirty();
        
        foreach ($dirty as $key => $value) {
            // Skip timestamps and hidden fields
            if ($this->shouldSkipLogging($key)) {
                continue;
            }
            
            $changes['old'][$key] = $original[$key] ?? null;
            $changes['new'][$key] = $value;
        }
        
        return $changes;
    }

    /**
     * Get loggable data (exclude hidden fields)
     */
    protected function getLoggableData()
    {
        $data = $this->toArray();
        
        // Remove hidden fields
        if (property_exists($this, 'hidden')) {
            foreach ($this->hidden as $field) {
                unset($data[$field]);
            }
        }
        
        // Remove timestamps and IDs if needed
        unset($data['created_at'], $data['updated_at'], $data['deleted_at']);
        
        // Remove sensitive data
        $sensitive = ['password', 'remember_token', 'api_token', 'secret'];
        foreach ($sensitive as $field) {
            if (isset($data[$field])) {
                $data[$field] = '******';
            }
        }
        
        return $data;
    }

    /**
     * Check if field should be skipped in logging
     */
    protected function shouldSkipLogging($field)
    {
        $skipFields = [
            'created_at',
            'updated_at',
            'deleted_at',
            'remember_token',
        ];
        
        return in_array($field, $skipFields);
    }

    /**
     * Get creation description
     */
    protected function getCreationDescription()
    {
        $userName = auth()->user()->name;
        $modelName = class_basename($this);
        
        return "{$modelName} créé(e) par {$userName}";
    }

    /**
     * Get update description
     */
    protected function getUpdateDescription($changes)
    {
        $userName = auth()->user()->name;
        $modelName = class_basename($this);
        $changedFields = implode(', ', array_keys($changes['new']));
        
        return "{$modelName} modifié(e) par {$userName} : {$changedFields}";
    }

    /**
     * Get deletion description
     */
    protected function getDeletionDescription()
    {
        $userName = auth()->user()->name;
        $modelName = class_basename($this);
        
        return "{$modelName} supprimé(e) par {$userName}";
    }

    /**
     * Get restoration description
     */
    protected function getRestorationDescription()
    {
        $userName = auth()->user()->name;
        $modelName = class_basename($this);
        
        return "{$modelName} restauré(e) par {$userName}";
    }

    /**
     * Get logs with pagination
     */
    public function getLogsPaginated($perPage = 15)
    {
        return $this->logs()
            ->with('user:id,name,email')
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get last activity
     */
    public function getLastActivityAttribute()
    {
        return $this->logs()->latest()->first();
    }

    /**
     * Get activity count
     */
    public function getActivityCountAttribute()
    {
        return $this->logs()->count();
    }

    /**
     * Scope to get models with recent activity
     */
    public function scopeWithRecentActivity($query, $days = 7)
    {
        return $query->whereHas('logs', function ($q) use ($days) {
            $q->where('created_at', '>=', now()->subDays($days));
        });
    }

    /**
     * Scope to get models by action type
     */
    public function scopeWhereAction($query, $action)
    {
        return $query->whereHas('logs', function ($q) use ($action) {
            $q->where('action', $action);
        });
    }

    /**
     * Get activity summary
     */
    public function getActivitySummary($days = 30)
    {
        return $this->logs()
            ->selectRaw('action, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('action')
            ->pluck('count', 'action')
            ->toArray();
    }
}