<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;

test('guests receive 401 unauthenticated on admin routes', function () {
    $this->getJson('/api/admin/users')->assertUnauthorized();
});

test('regular users get 403 forbidden on admin routes', function () {
    $user = User::factory()->create(['role' => UserRole::User]);

    $this->actingAs($user)
        ->getJson('/api/admin/users')
        ->assertForbidden();
});

test('admins can access admin routes', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->getJson('/api/admin/users')
        ->assertOk();
});

test('super admins can access admin routes', function () {
    $superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);

    $this->actingAs($superAdmin)
        ->getJson('/api/admin/users')
        ->assertOk();
});

test('suspended users receive 403 from protected routes', function () {
    $user = User::factory()->create([
        'role'         => UserRole::User,
        'suspended_at' => now(),
    ]);

    $this->actingAs($user)
        ->getJson('/api/dashboard')
        ->assertForbidden()
        ->assertJson(['message' => 'Your account is suspended.']);
});
