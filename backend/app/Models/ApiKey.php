<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

class ApiKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'provider',
        'name',
        'masked_key',
        'key',
        'priority',
        'status',
        'usage_count',
        'last_used_at',
        'cooldown_until',
        'last_failed_at',
        'failure_reason',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'key' => 'encrypted',
        'priority' => 'integer',
        'usage_count' => 'integer',
        'last_used_at' => 'datetime',
        'cooldown_until' => 'datetime',
        'last_failed_at' => 'datetime',
    ];

    /**
     * Never expose the raw key or user_id in standard JSON serialization.
     */
    protected $hidden = ['key'];

    protected static function booted(): void
    {
        static::creating(function (ApiKey $apiKey) {
            if (empty($apiKey->masked_key) && !empty($apiKey->key)) {
                $raw = $apiKey->key;
                $prefix = substr($raw, 0, 4);
                $suffix = substr($raw, -4);
                $apiKey->masked_key = "{$prefix}••••{$suffix}";
            }
        });
    }

    /**
     * Get the user that owns the API key.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Determine if this API key is currently eligible for request execution.
     */
    public function isEligible(): bool
    {
        if (in_array($this->status, ['invalid', 'disabled', 'revoked'], true)) {
            return false;
        }

        if ($this->status === 'rate_limited') {
            return $this->cooldown_until === null || $this->cooldown_until->isPast();
        }

        if ($this->status !== 'active') {
            return false;
        }

        if ($this->cooldown_until !== null && $this->cooldown_until->isFuture()) {
            return false;
        }

        return true;
    }

    /**
     * Record a successful usage of this key.
     */
    public function markUsed(): void
    {
        $this->increment('usage_count');
        $this->update([
            'last_used_at' => now(),
            'failure_reason' => null,
            'cooldown_until' => null,
        ]);
    }

    /**
     * Put the key into cooldown or mark as rate limited / invalid.
     */
    public function markFailed(string $reason, int $cooldownSeconds = 60, bool $permanent = false): void
    {
        $this->update([
            'last_failed_at' => now(),
            'failure_reason' => $reason,
            'status' => $permanent ? 'invalid' : ($cooldownSeconds > 0 ? 'rate_limited' : 'active'),
            'cooldown_until' => $cooldownSeconds > 0 ? now()->addSeconds($cooldownSeconds) : null,
        ]);
    }

    /**
     * Reset key cooldown and restore active state.
     */
    public function resetCooldown(): void
    {
        $this->update([
            'status' => 'active',
            'cooldown_until' => null,
            'failure_reason' => null,
        ]);
    }
}
