<?php

declare(strict_types=1);

use App\Models\User;

test('users can authenticate via API', function () {
    $user = User::factory()->create();

    $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'password',
    ])->assertStatus(200)
      ->assertJsonStructure(['user' => ['id', 'email'], 'token']);
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'wrong-password',
    ])->assertStatus(422);

    $this->assertGuest();
});

test('users can logout via API', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/api/logout')
        ->assertStatus(200)
        ->assertJson(['message' => 'Logged out successfully']);
});

test('last_login_at is recorded after successful login', function () {
    $user = User::factory()->create();

    $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'password',
    ]);

    expect($user->fresh()->last_login_at)->not->toBeNull();
});

test('unauthenticated users receive 401 on protected routes', function () {
    $this->getJson('/api/user')
        ->assertStatus(401)
        ->assertJson(['message' => 'Unauthenticated.']);
});

test('login throttle returns 422 after 5 failed attempts', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $attempt) {
        $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'wrong-password',
        ]);
    }

    $response = $this->postJson('/api/login', [
        'email'    => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(422)
             ->assertJsonValidationErrors(['email']);
});
