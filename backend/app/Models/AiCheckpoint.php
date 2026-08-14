<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiCheckpoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'resume_id',
        'operation_type',
        'step',
        'completed_steps',
        'partial_output',
        'active_key_id',
        'failover_count',
        'status',
    ];

    protected $casts = [
        'completed_steps' => 'array',
        'partial_output' => 'array',
        'failover_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resume(): BelongsTo
    {
        return $this->belongsTo(Resume::class);
    }

    public function activeKey(): BelongsTo
    {
        return $this->belongsTo(ApiKey::class, 'active_key_id');
    }
}
