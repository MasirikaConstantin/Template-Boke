<?php

namespace App\Models;

use App\Traits\HasLogs;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CategorieDepense extends Model
{

    use SoftDeletes, HasFactory, HasLogs;
    protected $table = "categories_depenses";
    protected $fillable = [
        'nom_categorie',
        'code',
        'description',
        'est_actif',
        'ref',
    ];

    protected $casts = [
        'est_actif' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($categorie) {
            if (empty($categorie->ref)) {
                $categorie->ref = \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function depenses(): HasMany
    {
        return $this->hasMany(Depense::class);
    }

    public function scopeActif($query)
    {
        return $query->where('est_actif', true);
    }
}