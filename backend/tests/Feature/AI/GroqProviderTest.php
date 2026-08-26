<?php

declare(strict_types=1);

use App\DTOs\AIProviderResponse;
use App\DTOs\AIRequest;
use App\Exceptions\AI\AIProviderException;
use App\Exceptions\AI\AuthenticationException;
use App\Exceptions\AI\QuotaExceededException;
use App\Exceptions\AI\RateLimitException;
use App\Exceptions\AI\TransientProviderException;
use App\Services\AI\GroqProvider;
use Illuminate\Support\Facades\Http;

test('groq provider completes request successfully with primary model', function () {
    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'id' => 'chatcmpl-123',
            'model' => 'llama-3.3-70b-versatile',
            'choices' => [
                [
                    'message' => [
                        'role' => 'assistant',
                        'content' => '{"basics":{"full_name":"Jane Doe"}}',
                    ],
                ],
            ],
            'usage' => [
                'prompt_tokens' => 100,
                'completion_tokens' => 50,
                'total_tokens' => 150,
            ],
        ], 200),
    ]);

    $provider = new GroqProvider();
    $request = new AIRequest(
        userPrompt: 'Parse resume',
        responseFormat: 'json_object'
    );

    $response = $provider->generate($request, 'gsk_test_key_123');

    expect($response)->toBeInstanceOf(AIProviderResponse::class);
    expect($response->model)->toBe('llama-3.3-70b-versatile');
    expect($response->parsedJson)->toBe(['basics' => ['full_name' => 'Jane Doe']]);
    expect($response->usage['total_tokens'])->toBe(150);
});

test('groq provider automatically falls back to secondary model when primary model returns 404 model not found', function () {
    $callCount = 0;

    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => function ($request) use (&$callCount) {
            $callCount++;
            $data = $request->data();

            if ($data['model'] === 'llama-3.3-70b-versatile') {
                return Http::response([
                    'error' => [
                        'message' => "The model 'llama-3.3-70b-versatile' does not exist or you do not have access to it.",
                        'type' => 'invalid_request_error',
                        'code' => 'model_not_found',
                    ],
                ], 404);
            }

            if ($data['model'] === 'llama-3.1-8b-instant') {
                return Http::response([
                    'id' => 'chatcmpl-fallback-456',
                    'model' => 'llama-3.1-8b-instant',
                    'choices' => [
                        [
                            'message' => [
                                'role' => 'assistant',
                                'content' => '{"basics":{"full_name":"John Smith"}}',
                            ],
                        ],
                    ],
                    'usage' => [
                        'prompt_tokens' => 80,
                        'completion_tokens' => 40,
                        'total_tokens' => 120,
                    ],
                ], 200);
            }

            return Http::response(['error' => ['message' => 'Unknown model']], 404);
        },
    ]);

    $provider = new GroqProvider();
    $request = new AIRequest(
        userPrompt: 'Parse resume',
        model: 'llama-3.3-70b-versatile',
        responseFormat: 'json_object'
    );

    $response = $provider->generate($request, 'gsk_test_key_123');

    expect($callCount)->toBe(2);
    expect($response->model)->toBe('llama-3.1-8b-instant');
    expect($response->parsedJson)->toBe(['basics' => ['full_name' => 'John Smith']]);
});

test('groq provider throws AIProviderException when all candidate models return 404', function () {
    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'error' => [
                'message' => 'The model does not exist or you do not have access to it.',
                'type' => 'invalid_request_error',
                'code' => 'model_not_found',
            ],
        ], 404),
    ]);

    $provider = new GroqProvider();
    $request = new AIRequest(userPrompt: 'Parse resume');

    expect(fn () => $provider->generate($request, 'gsk_test_key_123'))
        ->toThrow(AIProviderException::class);
});

test('groq provider correctly classifies 401 as AuthenticationException', function () {
    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'error' => [
                'message' => 'Invalid API Key',
                'type' => 'invalid_request_error',
            ],
        ], 401),
    ]);

    $provider = new GroqProvider();
    $request = new AIRequest(userPrompt: 'Test key');

    expect(fn () => $provider->generate($request, 'gsk_invalid_key'))
        ->toThrow(AuthenticationException::class);
});

test('groq provider correctly classifies 429 as RateLimitException', function () {
    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'error' => [
                'message' => 'Rate limit exceeded: TPM limit reached',
                'type' => 'rate_limit_exceeded',
            ],
        ], 429, ['Retry-After' => '45']),
    ]);

    $provider = new GroqProvider();
    $request = new AIRequest(userPrompt: 'Test rate limit');

    try {
        $provider->generate($request, 'gsk_key');
        expect(true)->toBeFalse(); // Should not reach here
    } catch (RateLimitException $e) {
        expect($e->retryAfterSeconds)->toBe(45);
    }
});

test('groq provider correctly classifies 402 as QuotaExceededException', function () {
    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'error' => [
                'message' => 'Insufficient quota for this account',
                'type' => 'insufficient_quota',
            ],
        ], 402),
    ]);

    $provider = new GroqProvider();
    $request = new AIRequest(userPrompt: 'Test quota');

    expect(fn () => $provider->generate($request, 'gsk_depleted_key'))
        ->toThrow(QuotaExceededException::class);
});

test('groq provider correctly classifies 503 as TransientProviderException', function () {
    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'error' => [
                'message' => 'Service Unavailable',
            ],
        ], 503),
    ]);

    $provider = new GroqProvider();
    $request = new AIRequest(userPrompt: 'Test 503');

    expect(fn () => $provider->generate($request, 'gsk_key'))
        ->toThrow(TransientProviderException::class);
});

test('groq provider automatically falls back when encountering HTTP 400 decommissioned model error', function () {
    $callCount = 0;

    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => function ($request) use (&$callCount) {
            $callCount++;
            $data = $request->data();

            if ($data['model'] === 'llama-3.3-70b-versatile') {
                return Http::response([
                    'error' => [
                        'message' => "The model 'llama-3.3-70b-versatile' has been decommissioned and is no longer supported.",
                        'type' => 'invalid_request_error',
                        'code' => 'model_decommissioned',
                    ],
                ], 400);
            }

            if ($data['model'] === 'llama-3.1-8b-instant') {
                return Http::response([
                    'id' => 'chatcmpl-qwen-789',
                    'model' => 'llama-3.1-8b-instant',
                    'choices' => [
                        [
                            'message' => [
                                'role' => 'assistant',
                                'content' => '{"basics":{"full_name":"Jane Smith"}}',
                            ],
                        ],
                    ],
                ], 200);
            }

            return Http::response(['error' => ['message' => 'Unknown']], 400);
        },
    ]);

    $provider = new GroqProvider();
    $request = new AIRequest(
        userPrompt: 'Parse resume',
        model: 'llama-3.3-70b-versatile',
        responseFormat: 'json_object'
    );

    $response = $provider->generate($request, 'gsk_test_key_123');

    expect($callCount)->toBe(2);
    expect($response->model)->toBe('llama-3.1-8b-instant');
    expect($response->parsedJson)->toBe(['basics' => ['full_name' => 'Jane Smith']]);
});

test('groq provider can dynamically fetch available models from API endpoint', function () {
    Http::fake([
        'https://api.groq.com/openai/v1/models' => Http::response([
            'data' => [
                ['id' => 'qwen/qwen3.8-27b'],
                ['id' => 'groq/compound'],
                ['id' => 'whisper-large-v3'],
            ],
        ], 200),
    ]);

    $provider = new GroqProvider();
    $models = $provider->getAvailableModels('gsk_test_key');

    expect($models)->toContain('qwen/qwen3.8-27b');
    expect($models)->toContain('groq/compound');
    expect($models)->not->toContain('whisper-large-v3');
});
