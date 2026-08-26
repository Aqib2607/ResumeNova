<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobPosting extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'company',
        'location',
        'work_mode',
        'employment_type',
        'description',
        'min_salary',
        'max_salary',
        'currency',
        'skills_required',
        'normalization_hash',
        'posted_at',
        'expires_at',
        'is_active',
    ];

    protected $casts = [
        'skills_required' => 'array',
        'posted_at' => 'datetime',
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'min_salary' => 'decimal:2',
        'max_salary' => 'decimal:2',
    ];

    protected $appends = [
        'company_name',
        'url',
        'salary_formatted',
    ];

    public function getCompanyNameAttribute(): string
    {
        return $this->company ?: 'Confidential Company';
    }

    public function getUrlAttribute(): ?string
    {
        $link = $this->relationLoaded('links') ? $this->links->first() : $this->links()->first();
        return $link?->url;
    }

    public function getSalaryFormattedAttribute(): ?string
    {
        if ($this->min_salary && $this->max_salary) {
            $curr = $this->currency ?: '$';
            return "{$curr}" . number_format((float)$this->min_salary) . " - {$curr}" . number_format((float)$this->max_salary);
        }
        if ($this->min_salary) {
            $curr = $this->currency ?: '$';
            return "From {$curr}" . number_format((float)$this->min_salary);
        }
        return null;
    }

    public function links()
    {
        return $this->hasMany(JobLink::class);
    }

    public function matches()
    {
        return $this->hasMany(JobMatch::class);
    }

    public function saves()
    {
        return $this->hasMany(SavedJob::class);
    }

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }
}
