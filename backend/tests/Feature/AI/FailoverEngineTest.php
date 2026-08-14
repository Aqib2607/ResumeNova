<?php

declare(strict_types=1);

use App\Contracts\AIProviderInterface;
use App\DTOs\AIProviderResponse;
use App\DTOs\AIRequest;
use App\Exceptions\AI\AllKeysExhaustedException;
use App\Exceptions\AI\RateLimitException;
use App\Models\AiCheckpoint;
use App\Models\ApiKey;
use App\Models\User;
use App\Services\AI\AIEngineService;
use App\Services\ApiKeyManager;

test('ai engine selects highest priority key and succeeds', function () {
    $user = User::factory()->create();

    $key1 = ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Priority 1 Key',
        'provider' => 'groq',
        'key' => 'gsk_key1_12345678',
        'masked_key' => 'gsk_••••5678',
        'priority' => 1,
        'status' => 'active',
    ]);

    $key2 = ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Priority 2 Key',
        'provider' => 'groq',
        'key' => 'gsk_key2_12345678',
        'masked_key' => 'gsk_••••5678',
        'priority' => 2,
        'status' => 'active',
    ]);

    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('getProviderName')->andReturn('groq');
    $mockProvider->shouldReceive('generate')
        ->once()
        ->with(Mockery::type(AIRequest::class), 'gsk_key1_12345678')
        ->andReturn(new AIProviderResponse(
            content: 'Successful AI completion',
            model: 'llama-3.3-70b-versatile',
            usage: ['total_tokens' => 100]
        ));

    $keyManager = new ApiKeyManager($mockProvider);
    $aiEngine = new AIEngineService($mockProvider, $keyManager);

    $response = $aiEngine->execute($user, new AIRequest(userPrompt: 'Hello'), 'test_op');

    expect($response->content)->toBe('Successful AI completion');
    expect($key1->fresh()->usage_count)->toBe(1);
    expect($key2->fresh()->usage_count)->toBe(0);
});

test('ai engine automatically fails over to next key on rate limit with checkpointing', function () {
    $user = User::factory()->create();

    $key1 = ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Rate Limited Key',
        'provider' => 'groq',
        'key' => 'gsk_ratelimited_1234',
        'masked_key' => 'gsk_••••1234',
        'priority' => 1,
        'status' => 'active',
    ]);

    $key2 = ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Backup Key',
        'provider' => 'groq',
        'key' => 'gsk_backup_123456',
        'masked_key' => 'gsk_••••3456',
        'priority' => 2,
        'status' => 'active',
    ]);

    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('getProviderName')->andReturn('groq');

    // First key hits 429 rate limit
    $mockProvider->shouldReceive('generate')
        ->once()
        ->with(Mockery::type(AIRequest::class), 'gsk_ratelimited_1234')
        ->andThrow(new RateLimitException('Rate limit reached', 60));

    // Second key succeeds
    $mockProvider->shouldReceive('generate')
        ->once()
        ->with(Mockery::type(AIRequest::class), 'gsk_backup_123456')
        ->andReturn(new AIProviderResponse(
            content: 'Backup completed content',
            model: 'llama-3.3-70b-versatile'
        ));

    $keyManager = new ApiKeyManager($mockProvider);
    $aiEngine = new AIEngineService($mockProvider, $keyManager);

    $response = $aiEngine->execute($user, new AIRequest(userPrompt: 'Test failover'), 'resume_summary');

    expect($response->content)->toBe('Backup completed content');

    // Key 1 marked rate limited / in cooldown
    expect($key1->fresh()->status)->toBe('rate_limited');
    expect($key1->fresh()->cooldown_until)->not->toBeNull();

    // Key 2 succeeded
    expect($key2->fresh()->usage_count)->toBe(1);

    // Checkpoint recorded failover
    $checkpoint = AiCheckpoint::where('user_id', $user->id)->first();
    expect($checkpoint)->not->toBeNull();
    expect($checkpoint->failover_count)->toBe(1);
    expect($checkpoint->status)->toBe('completed');
});

test('ai engine throws AllKeysExhaustedException when all keys fail', function () {
    $user = User::factory()->create();

    ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Exhausted Key',
        'provider' => 'groq',
        'key' => 'gsk_exhausted_1234',
        'masked_key' => 'gsk_••••1234',
        'priority' => 1,
        'status' => 'active',
    ]);

    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('getProviderName')->andReturn('groq');
    $mockProvider->shouldReceive('generate')
        ->andThrow(new RateLimitException('Rate limit hit', 60));

    $keyManager = new ApiKeyManager($mockProvider);
    $aiEngine = new AIEngineService($mockProvider, $keyManager);

    expect(fn () => $aiEngine->execute($user, new AIRequest(userPrompt: 'Test'), 'test'))
        ->toThrow(AllKeysExhaustedException::class);
});
