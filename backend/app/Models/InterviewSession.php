<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InterviewSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'resume_id',
        'category',
        'difficulty',
        'language',
        'job_description',
        'status',
        'total_questions',
        'completed_questions',
    ];

    protected $casts = [
        'total_questions' => 'integer',
        'completed_questions' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resume(): BelongsTo
    {
        return $this->belongsTo(Resume::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(InterviewQuestion::class, 'session_id')->orderBy('order', 'asc');
    }
}
