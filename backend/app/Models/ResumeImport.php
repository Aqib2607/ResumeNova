<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResumeImport extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_PROCESSING = 'processing';
    public const STATUS_READY = 'ready';
    public const STATUS_FAILED = 'failed';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_EXPIRED = 'expired';

    /**
     * The attributes that are mass assignable.
     * Note: user_id is explicitly NOT in fillable to prevent mass assignment vulnerability.
     */
    protected $fillable = [
        'user_id',
        'created_resume_id',
        'original_filename',
        'disk',
        'file_path',
        'status',
        'parsed_content',
        'error_message',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'parsed_content' => 'array',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the user that owns the import.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the confirmed resume created from this import.
     */
    public function createdResume(): BelongsTo
    {
        return $this->belongsTo(Resume::class, 'created_resume_id');
    }

    /**
     * Check if the import can currently be confirmed by the user.
     */
    public function isEligibleForConfirmation(): bool
    {
        return $this->status === self::STATUS_READY;
    }

    /**
     * Scope a query to only include expired or abandoned imports.
     */
    public function scopeExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNotNull('expires_at')
              ->where('expires_at', '<', now());
        })->orWhere(function ($q) {
            $q->whereNull('expires_at')
              ->where('created_at', '<', now()->subHours(24))
              ->whereIn('status', [self::STATUS_PENDING, self::STATUS_PROCESSING, self::STATUS_READY, self::STATUS_FAILED, self::STATUS_EXPIRED]);
        });
    }
}
