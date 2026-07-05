<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle an incoming authentication request.
     * Session is regenerated on login to prevent session fixation.
     */
    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();

        // Record the login timestamp on the authenticated user.
        $request->user()->recordLogin();

        $token = $request->user()->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $request->user(),
            'token' => $token,
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): JsonResponse
    {
        if ($user = $request->user()) {
            $token = $user->currentAccessToken();
            if ($token && method_exists($token, 'delete')) {
                $token->delete();
            }
        }

        return response()->json(['message' => 'Logged out successfully']);
    }
}
