<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobSource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'provider_type',
        'base_url',
        'is_active',
        'health_status',
        'last_success_at',
        'failure_count',
        'last_error',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_success_at' => 'datetime',
        'failure_count' => 'integer',
    ];

    public function jobPostings()
    {
        return $this->hasMany(JobPosting::class);
    }
}
