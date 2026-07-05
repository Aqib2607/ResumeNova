<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\User;

test('admin can assign user or admin role but not super_admin', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $target = User::factory()->create(['role' => UserRole::User]);

    // Admin should be able to update to Admin
    $this->actingAs($admin)
        ->patchJson("/api/admin/users/{$target->id}/role", ['role' => UserRole::Admin->value])
        ->assertStatus(200);

    // Admin should fail validation if they try to assign SuperAdmin
    $this->actingAs($admin)
        ->patchJson("/api/admin/users/{$target->id}/role", ['role' => UserRole::SuperAdmin->value])
        ->assertStatus(422)
        ->assertJsonValidationErrors('role');
});

test('super admin can assign any role', function () {
    $superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
    $target = User::factory()->create(['role' => UserRole::User]);

    $this->actingAs($superAdmin)
        ->patchJson("/api/admin/users/{$target->id}/role", ['role' => UserRole::SuperAdmin->value])
        ->assertStatus(200);
});

test('admin cannot change role of super_admin', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);

    $this->actingAs($admin)
        ->patchJson("/api/admin/users/{$superAdmin->id}/role", ['role' => UserRole::User->value])
        ->assertForbidden();
});

test('admin cannot suspend another admin', function () {
    $admin1 = User::factory()->create(['role' => UserRole::Admin]);
    $admin2 = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin1)
        ->postJson("/api/admin/users/{$admin2->id}/suspend")
        ->assertForbidden();
});

test('super admin can suspend admin', function () {
    $superAdmin = User::factory()->create(['role' => UserRole::SuperAdmin]);
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($superAdmin)
        ->postJson("/api/admin/users/{$admin->id}/suspend")
        ->assertStatus(200);
});

test('no one can suspend super admin', function () {
    $superAdmin1 = User::factory()->create(['role' => UserRole::SuperAdmin]);
    $superAdmin2 = User::factory()->create(['role' => UserRole::SuperAdmin]);

    $this->actingAs($superAdmin1)
        ->postJson("/api/admin/users/{$superAdmin2->id}/suspend")
        ->assertForbidden();
});

test('user cannot change their own role', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);

    $this->actingAs($admin)
        ->patchJson("/api/admin/users/{$admin->id}/role", ['role' => UserRole::User->value])
        ->assertForbidden();
});
