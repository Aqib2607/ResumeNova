<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobPreference extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'titles', // json
        'locations', // json
        'location_types', // json
        'employment_types', // json
        'min_salary',
        'salary_currency',
        'industries', // json
        'skills', // json
        'is_active',
    ];

    protected $casts = [
        'titles' => 'array',
        'locations' => 'array',
        'location_types' => 'array',
        'employment_types' => 'array',
        'industries' => 'array',
        'skills' => 'array',
        'is_active' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
