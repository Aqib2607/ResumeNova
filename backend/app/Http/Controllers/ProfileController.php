<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Services\ProfileService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Illuminate\View\View;

class ProfileController extends Controller
{
    public function __construct(
        private readonly ProfileService $profileService
    ) {}

    /**
     * Display the user's public profile.
     */
    public function index(Request $request): View
    {
        $user = $request->user()->load('profile');
        
        return view('profile.index', compact('user'));
    }

    /**
     * Display the user's profile editing form.
     */
    public function edit(Request $request): View
    {
        $user = $request->user()->load('profile');

        return view('profile.edit', compact('user'));
    }

    /**
     * Update the user's profile information and avatar.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
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

        return Redirect::route('profile.edit')->with('status', 'Profile successfully updated.');
    }
}
