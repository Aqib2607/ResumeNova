<?php

declare(strict_types=1);

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\Resume;
use App\Models\ResumeTemplate;
use App\Models\SystemLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->regularUser = User::factory()->create(['role' => UserRole::User]);
    $this->adminUser = User::factory()->create(['role' => UserRole::Admin]);
    $this->superAdminUser = User::factory()->create(['role' => UserRole::SuperAdmin]);
});

test('regular users cannot access any admin endpoint', function () {
    $this->actingAs($this->regularUser)->getJson('/api/admin/dashboard')->assertStatus(403);
    $this->actingAs($this->regularUser)->getJson('/api/admin/users')->assertStatus(403);
    $this->actingAs($this->regularUser)->getJson('/api/admin/templates')->assertStatus(403);
    $this->actingAs($this->regularUser)->getJson('/api/admin/analytics')->assertStatus(403);
    $this->actingAs($this->regularUser)->getJson('/api/admin/audit-logs')->assertStatus(403);
    $this->actingAs($this->regularUser)->getJson('/api/admin/system-logs')->assertStatus(403);
});

test('admin can access dashboard overview statistics', function () {
    Resume::factory()->count(3)->create(['user_id' => $this->regularUser->id]);

    $response = $this->actingAs($this->adminUser)->getJson('/api/admin/dashboard');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'users' => ['total', 'active', 'new_this_week', 'new_this_month'],
            'content' => ['total_resumes', 'total_cover_letters', 'total_ats_analyses', 'total_interview_sessions', 'total_exports'],
            'ai' => ['total_operations'],
        ]);
});

test('admin can list, search, and filter users', function () {
    User::factory()->create(['name' => 'John Developer', 'email' => 'john.dev@example.com']);
    User::factory()->create(['name' => 'Sarah Designer', 'email' => 'sarah.design@example.com']);

    $response = $this->actingAs($this->adminUser)->getJson('/api/admin/users?q=Developer');

    $response->assertStatus(200)
        ->assertJsonPath('total', 1)
        ->assertJsonPath('data.0.name', 'John Developer');
});

test('admin cannot modify or demote super admin', function () {
    $response = $this->actingAs($this->adminUser)->patchJson("/api/admin/users/{$this->superAdminUser->id}/role", [
        'role' => UserRole::User->value,
    ]);

    $response->assertStatus(403);
    expect($this->superAdminUser->fresh()->role)->toBe(UserRole::SuperAdmin);
});

test('super admin can change role and suspend users with audit logging', function () {
    $targetUser = User::factory()->create(['role' => UserRole::User]);

    $roleResponse = $this->actingAs($this->superAdminUser)->patchJson("/api/admin/users/{$targetUser->id}/role", [
        'role' => UserRole::Admin->value,
    ]);

    $roleResponse->assertStatus(200);
    expect($targetUser->fresh()->role)->toBe(UserRole::Admin);

    $this->assertDatabaseHas('role_audit_logs', [
        'user_id' => $targetUser->id,
        'changed_by' => $this->superAdminUser->id,
        'new_role' => UserRole::Admin->value,
    ]);

    $suspendResponse = $this->actingAs($this->superAdminUser)->postJson("/api/admin/users/{$targetUser->id}/suspend", [
        'reason' => 'Violation of terms',
    ]);

    $suspendResponse->assertStatus(200);
    expect($targetUser->fresh()->isSuspended())->toBeTrue();
});

test('admin can manage resume templates', function () {
    $createResponse = $this->actingAs($this->adminUser)->postJson('/api/admin/templates', [
        'slug' => 'nordic-minimal',
        'name' => 'Nordic Minimal',
        'category' => 'minimal',
        'description' => 'Nordic-inspired design with crisp typography.',
        'is_active' => true,
        'is_premium' => false,
    ]);

    $createResponse->assertStatus(201)
        ->assertJsonPath('template.slug', 'nordic-minimal');

    $templateId = $createResponse->json('template.id');

    $updateResponse = $this->actingAs($this->adminUser)->patchJson("/api/admin/templates/{$templateId}", [
        'name' => 'Nordic Minimalist Pro',
        'is_premium' => true,
    ]);

    $updateResponse->assertStatus(200)
        ->assertJsonPath('template.name', 'Nordic Minimalist Pro');

    $deleteResponse = $this->actingAs($this->adminUser)->deleteJson("/api/admin/templates/{$templateId}");
    $deleteResponse->assertStatus(200);

    $this->assertDatabaseMissing('resume_templates', ['id' => $templateId]);
});

test('admin can view analytics, audit logs, and sanitized system logs', function () {
    AuditLog::create([
        'user_id' => $this->adminUser->id,
        'action' => 'test_audit_event',
        'ip_address' => '127.0.0.1',
    ]);

    SystemLog::create([
        'level' => 'error',
        'message' => 'Test system error',
        'context' => [
            'api_key' => 'gsk_secret_key_12345',
            'details' => 'Connection timeout',
        ],
    ]);

    $analyticsRes = $this->actingAs($this->adminUser)->getJson('/api/admin/analytics');
    $analyticsRes->assertStatus(200)->assertJsonStructure(['user_growth', 'ai_activity', 'template_popularity']);

    $auditRes = $this->actingAs($this->adminUser)->getJson('/api/admin/audit-logs');
    $auditRes->assertStatus(200)->assertJsonCount(1, 'data');

    $systemRes = $this->actingAs($this->adminUser)->getJson('/api/admin/system-logs');
    $systemRes->assertStatus(200)
        ->assertJsonPath('data.0.context.api_key', '••••••••')
        ->assertJsonPath('data.0.context.details', 'Connection timeout');
});
