<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'order',
        'category',
        'difficulty',
        'question',
        'hints',
        'expected_answer',
        'user_answer',
        'evaluation',
        'score',
    ];

    protected $casts = [
        'order' => 'integer',
        'score' => 'integer',
        'hints' => 'array',
        'evaluation' => 'array',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(InterviewSession::class, 'session_id');
    }
}
