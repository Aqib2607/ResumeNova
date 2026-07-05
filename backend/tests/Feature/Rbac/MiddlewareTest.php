<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;

test('guests are redirected to login from admin routes', function () {
    $this->get('/admin/users')->assertRedirect(route('login'));
});

test('regular users get 403 forbidden on admin routes', function () {
    $user = User::factory()->create(['role' => UserRole::User]);

    $this->actingAs($user)
        ->get('/admin/users')
        ->assertForbidden();
});

test('admins can access admin routes', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertOk();
});

test('super admins can access admin routes', function () {
    $superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);

    $this->actingAs($superAdmin)
        ->get('/admin/users')
        ->assertOk();
});

test('suspended users are redirected to suspended page from protected routes', function () {
    $user = User::factory()->create([
        'role'         => UserRole::User,
        'suspended_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect(route('suspended'));
});

test('suspended users can view the suspended page', function () {
    $user = User::factory()->create([
        'suspended_at' => now(),
    ]);

    $this->actingAs($user)
        ->get('/suspended')
        ->assertOk()
        ->assertSee('Account Suspended');
});

test('active users are redirected away from suspended page', function () {
    $user = User::factory()->create([
        'suspended_at' => null,
    ]);

    $this->actingAs($user)
        ->get('/suspended')
        ->assertRedirect(route('dashboard'));
});
