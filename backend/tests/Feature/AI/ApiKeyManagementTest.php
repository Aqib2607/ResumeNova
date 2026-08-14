<?php

declare(strict_types=1);

use App\Models\ApiKey;
use App\Models\User;

test('unauthenticated users cannot manage api keys', function () {
    $this->getJson('/api/api-keys')->assertStatus(401);
    $this->postJson('/api/api-keys', ['name' => 'Key', 'key' => 'gsk_12345678'])->assertStatus(401);
});

test('user can store a new api key and it is encrypted', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson('/api/api-keys', [
        'name' => 'Primary Groq Key',
        'provider' => 'groq',
        'key' => 'gsk_supersecretkey1234567890',
        'priority' => 1,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.name', 'Primary Groq Key')
        ->assertJsonPath('data.provider', 'groq')
        ->assertJsonPath('data.masked_key', 'gsk_••••7890');

    // Verify raw key is NEVER returned in response
    $response->assertJsonMissing(['key' => 'gsk_supersecretkey1234567890']);

    // Verify database record exists and is stored
    $this->assertDatabaseHas('api_keys', [
        'user_id' => $user->id,
        'name' => 'Primary Groq Key',
        'masked_key' => 'gsk_••••7890',
    ]);

    $storedKey = ApiKey::where('user_id', $user->id)->first();
    expect($storedKey->key)->toBe('gsk_supersecretkey1234567890');
});

test('user can list their own api keys', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    ApiKey::create([
        'user_id' => $user->id,
        'name' => 'User Key',
        'provider' => 'groq',
        'key' => 'gsk_test12345678',
        'masked_key' => 'gsk_••••5678',
        'priority' => 1,
    ]);

    ApiKey::create([
        'user_id' => $otherUser->id,
        'name' => 'Other User Key',
        'provider' => 'groq',
        'key' => 'gsk_other12345678',
        'masked_key' => 'gsk_••••5678',
        'priority' => 1,
    ]);

    $response = $this->actingAs($user)->getJson('/api/api-keys');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.name', 'User Key');
});

test('user cannot access or delete another users api key', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $otherKey = ApiKey::create([
        'user_id' => $otherUser->id,
        'name' => 'Other Key',
        'provider' => 'groq',
        'key' => 'gsk_otherkey123456',
        'masked_key' => 'gsk_••••3456',
        'priority' => 1,
    ]);

    $this->actingAs($user)->getJson("/api/api-keys/{$otherKey->id}")->assertStatus(403);
    $this->actingAs($user)->deleteJson("/api/api-keys/{$otherKey->id}")->assertStatus(403);
});

test('user can delete their own api key', function () {
    $user = User::factory()->create();

    $key = ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Key to delete',
        'provider' => 'groq',
        'key' => 'gsk_deleteme123456',
        'masked_key' => 'gsk_••••3456',
        'priority' => 1,
    ]);

    $this->actingAs($user)->deleteJson("/api/api-keys/{$key->id}")->assertStatus(200);
    $this->assertDatabaseMissing('api_keys', ['id' => $key->id]);
});
