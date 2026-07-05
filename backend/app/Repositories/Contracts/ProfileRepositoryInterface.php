<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\Profile;

interface ProfileRepositoryInterface
{
    /**
     * Find a profile by user ID or create one if it doesn't exist.
     */
    public function firstOrCreateForUser(int $userId): Profile;

    /**
     * Update the profile data for a specific user.
     * 
     * @param array<string, mixed> $data
     */
    public function updateForUser(int $userId, array $data): Profile;
}
