<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use App\Repositories\Contracts\ProfileRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileService
{
    public function __construct(
        private readonly ProfileRepositoryInterface $profileRepository
    ) {}

    /**
     * Update the user's profile and optionally handle an avatar upload.
     */
    public function updateProfile(User $user, array $data, ?UploadedFile $avatar = null): void
    {
        $oldProfile = $user->profile?->toArray() ?? [];

        // Handle avatar upload if provided
        if ($avatar) {
            $this->handleAvatarUpload($user, $avatar);
        }

        // Update the profile using the repository
        $newProfile = $this->profileRepository->updateForUser($user->id, $data);

        // Audit Log
        $this->logProfileUpdate($user, $oldProfile, $newProfile->toArray());
    }

    /**
     * Handle avatar file upload and delete the old one.
     */
    private function handleAvatarUpload(User $user, UploadedFile $avatar): void
    {
        // Delete old avatar if it exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $avatar->store('avatars', 'public');
        
        $user->update(['avatar' => $path]);
    }

    /**
     * Write an audit log for a profile update.
     */
    private function logProfileUpdate(User $user, array $oldValues, array $newValues): void
    {
        // Calculate diff to avoid massive logs
        $oldDiff = [];
        $newDiff = [];

        foreach ($newValues as $key => $value) {
            if (! array_key_exists($key, $oldValues) || $oldValues[$key] !== $value) {
                // Skip timestamps and id
                if (in_array($key, ['id', 'user_id', 'created_at', 'updated_at', 'deleted_at'])) {
                    continue;
                }
                
                $oldDiff[$key] = $oldValues[$key] ?? null;
                $newDiff[$key] = $value;
            }
        }

        if (! empty($newDiff)) {
            AuditLog::create([
                'user_id'     => $user->id,
                'action'      => 'profile_updated',
                'entity_type' => 'profile',
                'entity_id'   => (string) ($newValues['id'] ?? ''),
                'old_values'  => $oldDiff,
                'new_values'  => $newDiff,
                'ip_address'  => request()->ip(),
            ]);
        }
    }
}
