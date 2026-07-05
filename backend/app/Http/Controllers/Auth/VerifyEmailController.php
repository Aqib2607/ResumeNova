<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $frontendUrl = config('app.frontend_url', 'http://127.0.0.1:5173');

        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended($frontendUrl.'/dashboard?verified=1');
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return redirect()->intended($frontendUrl.'/dashboard?verified=1');
    }
}
