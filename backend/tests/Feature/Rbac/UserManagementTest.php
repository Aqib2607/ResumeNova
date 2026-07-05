<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\RoleAuditLog;
use App\Models\User;

test('role assignment writes to role audit logs', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $target = User::factory()->create(['role' => UserRole::User]);

    $this->actingAs($admin)
        ->patch("/admin/users/{$target->id}/role", ['role' => UserRole::Admin->value])
        ->assertRedirect();

    expect($target->fresh()->role)->toBe(UserRole::Admin);
    
    // Observer should have created a log
    $log = RoleAuditLog::where('user_id', $target->id)->first();
    expect($log)->not->toBeNull()
        ->and($log->old_role)->toBe(UserRole::User->value)
        ->and($log->new_role)->toBe(UserRole::Admin->value)
        ->and($log->changed_by)->toBe($admin->id);
});

test('suspend sets suspended_at timestamp and logs event', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $target = User::factory()->create(['role' => UserRole::User, 'suspended_at' => null]);

    $this->actingAs($admin)
        ->post("/admin/users/{$target->id}/suspend")
        ->assertRedirect();

    expect($target->fresh()->isSuspended())->toBeTrue();
    
    // Observer should have created a log
    $log = RoleAuditLog::where('user_id', $target->id)->first();
    expect($log)->not->toBeNull()
        ->and($log->reason)->toBe('Account suspended')
        ->and($log->changed_by)->toBe($admin->id);
});

test('reactivate clears suspended_at timestamp and logs event', function () {
    $admin = User::factory()->create(['role' => UserRole::Admin]);
    $target = User::factory()->create(['role' => UserRole::User, 'suspended_at' => now()]);

    $this->actingAs($admin)
        ->post("/admin/users/{$target->id}/reactivate")
        ->assertRedirect();

    expect($target->fresh()->isSuspended())->toBeFalse();
    
    // Observer should have created a log
    $log = RoleAuditLog::where('user_id', $target->id)->latest('id')->first();
    expect($log)->not->toBeNull()
        ->and($log->reason)->toBe('Account reactivated')
        ->and($log->changed_by)->toBe($admin->id);
});
