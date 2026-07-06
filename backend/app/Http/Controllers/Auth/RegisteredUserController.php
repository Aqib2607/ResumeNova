<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * Validation is fully handled by RegisterRequest.
     */
    public function store(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name'     => $request->validated('name'),
            'email'    => $request->validated('email'),
            'password' => $request->validated('password'),
        ]);

        event(new Registered($user));

        $token = $user->createToken('spa')->plainTextToken;

        $user->recordLogin();

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }
}
