<?php

declare(strict_types=1);

namespace App\Services;

use App\Contracts\AIProviderInterface;
use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ApiKeyManager
{
    public function __construct(
        protected AIProviderInterface $provider
    ) {}

    /**
     * Get all API keys for a user, sorted by priority.
     *
     * @return Collection<int, ApiKey>
     */
    public function listForUser(User $user, ?string $providerName = null): Collection
    {
        $query = ApiKey::where('user_id', $user->id);

        if ($providerName) {
            $query->where('provider', $providerName);
        }

        return $query->orderBy('priority', 'asc')->orderBy('id', 'asc')->get();
    }

    /**
     * Get the next eligible API key for execution.
     */
    public function getNextEligibleKey(User $user, ?string $providerName = 'groq', ?int $excludeKeyId = null): ?ApiKey
    {
        $query = ApiKey::where('user_id', $user->id)
            ->where('provider', $providerName ?: 'groq')
            ->where('status', 'active')
            ->where(function ($q) {
                $q->whereNull('cooldown_until')
                  ->orWhere('cooldown_until', '<=', now());
            });

        if ($excludeKeyId) {
            $query->where('id', '!=', $excludeKeyId);
        }

        return $query->orderBy('priority', 'asc')->orderBy('last_used_at', 'asc')->first();
    }

    /**
     * Store a new API key for the user.
     */
    public function storeKey(User $user, array $data): ApiKey
    {
        $rawKey = trim($data['key'] ?? '');
        if (empty($rawKey)) {
            throw new InvalidArgumentException('API Key cannot be empty.');
        }

        $masked = $this->maskKey($rawKey);
        $maxPriority = (int) ApiKey::where('user_id', $user->id)->max('priority');

        return ApiKey::create([
            'user_id' => $user->id,
            'provider' => $data['provider'] ?? 'groq',
            'name' => $data['name'] ?? 'Groq Key ' . ($maxPriority + 1),
            'masked_key' => $masked,
            'key' => $rawKey, // Model cast 'encrypted' securely handles AES encryption
            'priority' => $data['priority'] ?? ($maxPriority + 1),
            'status' => 'active',
        ]);
    }

    /**
     * Update an API key's metadata.
     */
    public function updateKey(ApiKey $key, array $data): ApiKey
    {
        $updates = [];

        if (isset($data['name'])) {
            $updates['name'] = $data['name'];
        }

        if (isset($data['status']) && in_array($data['status'], ['active', 'rate_limited', 'invalid', 'disabled'], true)) {
            $updates['status'] = $data['status'];
            if ($data['status'] === 'active') {
                $updates['cooldown_until'] = null;
                $updates['failure_reason'] = null;
            }
        }

        if (isset($data['priority'])) {
            $updates['priority'] = (int) $data['priority'];
        }

        if (!empty($data['key'])) {
            $rawKey = trim($data['key']);
            $updates['key'] = $rawKey;
            $updates['masked_key'] = $this->maskKey($rawKey);
            $updates['status'] = 'active';
            $updates['cooldown_until'] = null;
            $updates['failure_reason'] = null;
        }

        $key->update($updates);
        return $key->fresh();
    }

    /**
     * Reorder priority for a set of user keys.
     *
     * @param array<int, int> $keyIdsOrdered
     */
    public function reorderPriorities(User $user, array $keyIdsOrdered): void
    {
        DB::transaction(function () use ($user, $keyIdsOrdered) {
            foreach ($keyIdsOrdered as $index => $keyId) {
                ApiKey::where('user_id', $user->id)
                    ->where('id', $keyId)
                    ->update(['priority' => $index + 1]);
            }
        });
    }

    /**
     * Delete an API key.
     */
    public function deleteKey(ApiKey $key): void
    {
        $key->delete();
    }

    /**
     * Create a masked representation of an API key.
     * e.g., 'gsk_1234567890abcdef' -> 'gsk_...cdef'
     */
    public function maskKey(string $key): string
    {
        $len = strlen($key);
        if ($len <= 8) {
            return '••••••••';
        }

        $prefix = substr($key, 0, 4);
        $suffix = substr($key, -4);

        return $prefix . '••••' . $suffix;
    }
}
