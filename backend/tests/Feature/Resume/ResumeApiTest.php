<?php

declare(strict_types=1);

use App\Models\Resume;
use App\Models\User;

test('unauthenticated users cannot access resume endpoints', function () {
    $this->getJson('/api/resumes')->assertStatus(401);
    $this->postJson('/api/resumes', ['title' => 'Test'])->assertStatus(401);
});

test('authenticated user can create a resume', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/resumes', [
        'title' => 'Senior Backend Engineer',
        'template' => 'modern-professional',
        'language' => 'en',
        'content' => [
            'basics' => [
                'full_name' => 'Jane Doe',
                'headline' => 'Senior Backend Engineer',
                'email' => 'jane@example.com',
            ],
            'experiences' => [],
        ],
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.title', 'Senior Backend Engineer')
        ->assertJsonPath('data.template', 'modern-professional')
        ->assertJsonPath('data.basics.full_name', 'Jane Doe');

    $this->assertDatabaseHas('resumes', [
        'user_id' => $user->id,
        'title' => 'Senior Backend Engineer',
    ]);
});

test('user can list their own resumes', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Resume::factory()->count(2)->create(['user_id' => $user->id]);
    Resume::factory()->count(3)->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user)->getJson('/api/resumes');

    $response->assertStatus(200)
        ->assertJsonCount(2, 'data');
});

test('user can update their own resume', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->create(['user_id' => $user->id, 'title' => 'Old Title']);

    $response = $this->actingAs($user)->putJson("/api/resumes/{$resume->id}", [
        'title' => 'New Title',
        'template' => 'ats-professional',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.title', 'New Title')
        ->assertJsonPath('data.template', 'ats-professional');

    $this->assertDatabaseHas('resumes', [
        'id' => $resume->id,
        'title' => 'New Title',
    ]);
});

test('user cannot update another users resume', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $resume = Resume::factory()->create(['user_id' => $otherUser->id, 'title' => 'Other Title']);

    $this->actingAs($user)->putJson("/api/resumes/{$resume->id}", [
        'title' => 'Hacked Title',
    ])->assertStatus(403);
});

test('user can duplicate their own resume', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->create([
        'user_id' => $user->id,
        'title' => 'Original Resume',
        'content' => ['basics' => ['full_name' => 'Original User']],
    ]);

    $response = $this->actingAs($user)->postJson("/api/resumes/{$resume->id}/duplicate");

    $response->assertStatus(201)
        ->assertJsonPath('data.title', 'Original Resume (Copy)');

    $this->assertDatabaseCount('resumes', 2);
});

test('user can soft-delete their own resume', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)->deleteJson("/api/resumes/{$resume->id}")
        ->assertStatus(200);

    $this->assertSoftDeleted('resumes', ['id' => $resume->id]);
});
