<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Resume extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'template',
        'version',
        'status',
        'language',
        'content',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    /**
     * Get the user that owns the resume.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the historical versions for the resume.
     */
    public function versions(): HasMany
    {
        return $this->hasMany(ResumeVersion::class)->orderBy('version_number', 'desc');
    }

    /**
     * Create a historical snapshot of this resume.
     */
    public function createVersionSnapshot(): ResumeVersion
    {
        $nextVersionNumber = ($this->versions()->max('version_number') ?? 0) + 1;

        return $this->versions()->create([
            'version_number' => $nextVersionNumber,
            'title' => $this->title,
            'template' => $this->template ?? 'modern-professional',
            'content' => $this->content,
        ]);
    }

    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }
}
