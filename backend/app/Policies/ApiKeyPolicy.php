<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ApiKey;
use App\Models\User;

class ApiKeyPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ApiKey $apiKey): bool
    {
        return $apiKey->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ApiKey $apiKey): bool
    {
        return $apiKey->user_id === $user->id;
    }

    public function delete(User $user, ApiKey $apiKey): bool
    {
        return $apiKey->user_id === $user->id;
    }
}
