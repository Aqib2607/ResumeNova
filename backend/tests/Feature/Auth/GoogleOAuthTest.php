<?php

declare(strict_types=1);

use App\Models\User;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

// ──────────────────────────────────────────────────────────────────────────────
// Helper: Build a fake Socialite user object.
// ──────────────────────────────────────────────────────────────────────────────
function fakeSocialiteUser(
    string $id = '123456789',
    string $name = 'John Doe',
    string $email = 'john@example.com',
    string $avatar = 'https://example.com/avatar.jpg',
): SocialiteUser {
    $socialiteUser = Mockery::mock(SocialiteUser::class);
    $socialiteUser->shouldReceive('getId')->andReturn($id);
    $socialiteUser->shouldReceive('getName')->andReturn($name);
    $socialiteUser->shouldReceive('getEmail')->andReturn($email);
    $socialiteUser->shouldReceive('getAvatar')->andReturn($avatar);

    return $socialiteUser;
}

// ──────────────────────────────────────────────────────────────────────────────
// Redirect Tests
// ──────────────────────────────────────────────────────────────────────────────

it('returns google consent screen authorization url for unauthenticated users', function () {
    $response = $this->get(route('auth.google'));

    $response->assertStatus(200)
        ->assertJsonStructure(['url']);
    expect($response->json('url'))->toContain('accounts.google.com');
});

it('returns authorization url for json api requests', function () {
    $response = $this->getJson(route('auth.google'));

    $response->assertStatus(200)
        ->assertJsonStructure(['url']);
    expect($response->json('url'))->toContain('accounts.google.com');
});

// ──────────────────────────────────────────────────────────────────────────────
// Callback – New User Creation
// ──────────────────────────────────────────────────────────────────────────────

it('creates a new user from google profile on first oauth login', function () {
    $socialiteUser = fakeSocialiteUser(
        id: '987654321',
        email: 'newuser@google.com',
    );

    $provider = Mockery::mock(\Laravel\Socialite\Contracts\Provider::class);
    $provider->shouldReceive('stateless')->andReturnSelf();
    $provider->shouldReceive('user')->andReturn($socialiteUser);
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->getJson(route('auth.google.callback'))
        ->assertRedirectContains(config('app.frontend_url').'/oauth/callback?token=');

    $user = User::where('email', 'newuser@google.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->google_id)->toBe('987654321')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->password)->toBeNull();
});

// ──────────────────────────────────────────────────────────────────────────────
// Callback – Existing User by Google ID
// ──────────────────────────────────────────────────────────────────────────────

it('logs in an existing user matched by google_id', function () {
    $user = User::factory()->create([
        'google_id' => '111222333',
        'email'     => 'existing@example.com',
    ]);

    $socialiteUser = fakeSocialiteUser(id: '111222333', email: 'existing@example.com');

    $provider = Mockery::mock(\Laravel\Socialite\Contracts\Provider::class);
    $provider->shouldReceive('stateless')->andReturnSelf();
    $provider->shouldReceive('user')->andReturn($socialiteUser);
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->getJson(route('auth.google.callback'))
        ->assertRedirectContains(config('app.frontend_url').'/oauth/callback?token=');
});

// ──────────────────────────────────────────────────────────────────────────────
// Callback – Link Google to Existing Email Account
// ──────────────────────────────────────────────────────────────────────────────

it('links google_id to an existing email-only account', function () {
    $user = User::factory()->create([
        'email'     => 'earlybird@example.com',
        'google_id' => null,
    ]);

    $socialiteUser = fakeSocialiteUser(
        id: '999888777',
        email: 'earlybird@example.com',
    );

    $provider = Mockery::mock(\Laravel\Socialite\Contracts\Provider::class);
    $provider->shouldReceive('stateless')->andReturnSelf();
    $provider->shouldReceive('user')->andReturn($socialiteUser);
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->getJson(route('auth.google.callback'))
        ->assertRedirectContains(config('app.frontend_url').'/oauth/callback?token=');

    expect($user->fresh()->google_id)->toBe('999888777');
});

// ──────────────────────────────────────────────────────────────────────────────
// Callback – Records last_login_at
// ──────────────────────────────────────────────────────────────────────────────

it('records last_login_at after google oauth login', function () {
    $socialiteUser = fakeSocialiteUser(
        id: '777666555',
        email: 'timestamped@example.com',
    );

    $provider = Mockery::mock(\Laravel\Socialite\Contracts\Provider::class);
    $provider->shouldReceive('stateless')->andReturnSelf();
    $provider->shouldReceive('user')->andReturn($socialiteUser);
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->getJson(route('auth.google.callback'));

    $user = User::where('email', 'timestamped@example.com')->first();

    expect($user->last_login_at)->not->toBeNull();
});

// ──────────────────────────────────────────────────────────────────────────────
// Callback – Error Handling
// ──────────────────────────────────────────────────────────────────────────────

it('redirects to login with error when google oauth callback fails', function () {
    $provider = Mockery::mock(\Laravel\Socialite\Contracts\Provider::class);
    $provider->shouldReceive('stateless')->andReturnSelf();
    $provider->shouldReceive('user')->andThrow(new \Exception('OAuth error'));
    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

    $this->getJson(route('auth.google.callback'))
        ->assertRedirect(config('app.frontend_url').'/login?error=google_auth_failed');
});
