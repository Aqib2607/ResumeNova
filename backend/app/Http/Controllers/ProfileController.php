<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ProfileService $profileService
    ) {}

    /**
     * Get the user's public profile.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');
        
        return response()->json(['user' => $user]);
    }

    /**
     * Update the user's profile information and avatar.
     */
    public function update(ProfileUpdateRequest $request): JsonResponse
    {
        $user = $request->user();
        
        // Update core user fields
        $user->update([
            'name' => $request->validated('name'),
        ]);

        // Extract profile specific data
        $profileData = $request->only(['headline', 'bio', 'location', 'website', 'social_links']);
        
        // Update profile via service (handles avatar upload and audit logging)
        $this->profileService->updateProfile(
            $user, 
            $profileData, 
            $request->file('avatar')
        );

        return response()->json(['message' => 'Profile successfully updated', 'user' => $user->fresh('profile')]);
    }
}
