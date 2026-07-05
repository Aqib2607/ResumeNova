<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;

// ──────────────────────────────────────────────────────────────────────────────
// Existing Breeze Tests (preserved)
// ──────────────────────────────────────────────────────────────────────────────

test('registration screen can be rendered', function () {
    $this->get('/register')->assertStatus(200);
});

test('new users can register with valid data', function () {
    $this->post('/register', [
        'name'                  => 'Test User',
        'email'                 => 'test@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticated();
});

// ──────────────────────────────────────────────────────────────────────────────
// Enhanced Tests – Part 2
// ──────────────────────────────────────────────────────────────────────────────

test('new user is assigned the user role by default', function () {
    $this->post('/register', [
        'name'                  => 'Regular User',
        'email'                 => 'regular@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ]);

    $user = User::where('email', 'regular@example.com')->first();

    expect($user->role)->toBe(UserRole::User);
});

test('registration fails with duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $this->post('/register', [
        'name'                  => 'Another User',
        'email'                 => 'taken@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('registration fails with mismatched password confirmation', function () {
    $this->post('/register', [
        'name'                  => 'Bad Confirm',
        'email'                 => 'badconfirm@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'DifferentPass1!',
    ])->assertSessionHasErrors('password');

    $this->assertGuest();
});

test('registration fails with weak password', function () {
    $this->post('/register', [
        'name'                  => 'Weak User',
        'email'                 => 'weak@example.com',
        'password'              => 'abc',          // too short – fails Password::min(8)
        'password_confirmation' => 'abc',
    ])->assertSessionHasErrors('password');

    $this->assertGuest();
});

test('registration fails with name that is too short', function () {
    $this->post('/register', [
        'name'                  => 'A',
        'email'                 => 'shortname@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ])->assertSessionHasErrors('name');

    $this->assertGuest();
});

test('registration records last_login_at after sign up', function () {
    $this->post('/register', [
        'name'                  => 'Timestamp User',
        'email'                 => 'timestamp@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ]);

    $user = User::where('email', 'timestamp@example.com')->first();

    expect($user->last_login_at)->not->toBeNull();
});

test('google oauth button link is present on registration screen', function () {
    $this->get('/register')
        ->assertStatus(200)
        ->assertSee(route('auth.google'));
});
