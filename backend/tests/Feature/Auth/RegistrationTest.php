<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;

test('new users can register via API', function () {
    $this->postJson('/api/register', [
        'name'                  => 'Test User',
        'email'                 => 'test@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ])->assertStatus(201)
      ->assertJsonStructure(['user' => ['id', 'name', 'email']]);

    $this->assertAuthenticated();
});

test('new user is assigned the user role by default', function () {
    $this->postJson('/api/register', [
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

    $this->postJson('/api/register', [
        'name'                  => 'Another User',
        'email'                 => 'taken@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['email']);

    $this->assertGuest();
});

test('registration fails with mismatched password confirmation', function () {
    $this->postJson('/api/register', [
        'name'                  => 'Bad Confirm',
        'email'                 => 'badconfirm@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'DifferentPass1!',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['password']);

    $this->assertGuest();
});

test('registration fails with weak password', function () {
    $this->postJson('/api/register', [
        'name'                  => 'Weak User',
        'email'                 => 'weak@example.com',
        'password'              => 'abc',
        'password_confirmation' => 'abc',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['password']);

    $this->assertGuest();
});

test('registration fails with name that is too short', function () {
    $this->postJson('/api/register', [
        'name'                  => 'A',
        'email'                 => 'shortname@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['name']);

    $this->assertGuest();
});

test('registration records last_login_at after sign up', function () {
    $this->postJson('/api/register', [
        'name'                  => 'Timestamp User',
        'email'                 => 'timestamp@example.com',
        'password'              => 'Password1!',
        'password_confirmation' => 'Password1!',
    ]);

    $user = User::where('email', 'timestamp@example.com')->first();

    expect($user->last_login_at)->not->toBeNull();
});
