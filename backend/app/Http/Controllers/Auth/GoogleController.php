<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleController extends Controller
{
    /**
     * Redirect the user to the Google OAuth consent screen.
     */
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Handle the callback from Google.
     *
     * Flow:
     *   1. Fetch user data from Google.
     *   2. Find existing user by google_id OR email.
     *   3. If found by email only → link the google_id to that account.
     *   4. If not found → create a new user (auto-verified, no password).
     *   5. Login + session regenerate + record last_login_at.
     */
    public function callback(): RedirectResponse
    {
        $frontendUrl = config('app.frontend_url', 'http://127.0.0.1:5173');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (Throwable $e) {
            Log::warning('Google OAuth callback failed.', [
                'error' => $e->getMessage(),
            ]);

            return redirect()->intended($frontendUrl.'/login?error=google_auth_failed');
        }

        /** @var User|null $user */
        $user = User::where('google_id', $googleUser->getId())->first()
            ?? User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            // Link Google credentials if this account was previously email-only.
            if (! $user->google_id) {
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar'    => $googleUser->getAvatar(),
                ]);
            }
        } else {
            // Create a brand-new user from the Google profile.
            $user = User::create([
                'name'              => $googleUser->getName(),
                'email'             => $googleUser->getEmail(),
                'google_id'         => $googleUser->getId(),
                'avatar'            => $googleUser->getAvatar(),
                'password'          => null,           // OAuth users have no local password
                'email_verified_at' => now(),          // Google has verified the email
            ]);
        }

        // Login via token instead of session.
        $user->recordLogin();
        $token = $user->createToken('google_oauth_token')->plainTextToken;

        return redirect()->intended($frontendUrl.'/oauth/callback?token='.$token);
    }
}
