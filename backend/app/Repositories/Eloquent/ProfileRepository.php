<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\Profile;
use App\Repositories\Contracts\ProfileRepositoryInterface;

class ProfileRepository implements ProfileRepositoryInterface
{
    public function firstOrCreateForUser(int $userId): Profile
    {
        return Profile::firstOrCreate(
            ['user_id' => $userId],
            []
        );
    }

    public function updateForUser(int $userId, array $data): Profile
    {
        $profile = $this->firstOrCreateForUser($userId);
        
        $profile->update($data);
        
        return $profile;
    }
}
