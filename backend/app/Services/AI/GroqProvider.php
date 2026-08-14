<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Contracts\AIProviderInterface;
use App\DTOs\AIProviderResponse;
use App\DTOs\AIRequest;
use App\Exceptions\AI\AIProviderException;
use App\Exceptions\AI\AuthenticationException;
use App\Exceptions\AI\QuotaExceededException;
use App\Exceptions\AI\RateLimitException;
use App\Exceptions\AI\TransientProviderException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class GroqProvider implements AIProviderInterface
{
    protected string $baseUrl;
    protected string $defaultModel;
    protected int $timeout;
    protected int $maxRetries;
    protected bool $verifySsl;

    public function __construct()
    {
        $this->baseUrl = (string) config('groq.base_url', 'https://api.groq.com/openai/v1');
        $this->defaultModel = (string) config('groq.default_model', 'llama-3.3-70b-versatile');
        $this->timeout = (int) config('groq.timeout', 30);
        $this->maxRetries = (int) config('groq.max_retries', 3);
        $this->verifySsl = (bool) config('groq.verify_ssl', false);
    }

    public function getProviderName(): string
    {
        return 'groq';
    }

    /**
     * Generate content via Groq Chat Completions API.
     */
    public function generate(AIRequest $request, string $apiKey): AIProviderResponse
    {
        $url = rtrim($this->baseUrl, '/') . '/chat/completions';
        $model = $request->model ?: $this->defaultModel;

        $payload = [
            'model' => $model,
            'messages' => $request->toMessages(),
            'temperature' => $request->temperature,
            'max_tokens' => $request->maxTokens,
        ];

        if ($request->responseFormat === 'json_object') {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        try {
            $httpClient = Http::withToken($apiKey)
                ->timeout($this->timeout)
                ->asJson()
                ->acceptJson();

            if (!$this->verifySsl) {
                $httpClient = $httpClient->withoutVerifying();
            }

            $response = $httpClient->post($url, $payload);
        } catch (Throwable $e) {
            Log::warning('Groq HTTP connection failure: ' . $e->getMessage());
            throw new TransientProviderException(
                'Failed to communicate with Groq AI service: ' . $e->getMessage(),
                503,
                ['error' => $e->getMessage()]
            );
        }

        if ($response->successful()) {
            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? '';
            $usage = $data['usage'] ?? [];
            $parsedJson = null;

            if ($request->responseFormat === 'json_object') {
                $decoded = json_decode($content, true);
                if (is_array($decoded)) {
                    $parsedJson = $decoded;
                }
            }

            return new AIProviderResponse(
                content: $content,
                model: $data['model'] ?? $model,
                usage: $usage,
                parsedJson: $parsedJson,
                rawResponse: $data
            );
        }

        $statusCode = $response->status();
        $errorBody = $response->json('error') ?? [];
        $errorMessage = is_array($errorBody) ? ($errorBody['message'] ?? $response->body()) : $response->body();
        $errorType = is_array($errorBody) ? ($errorBody['type'] ?? '') : '';

        // Classify Groq Error Responses
        if ($statusCode === 401 || $statusCode === 403 || str_contains(strtolower($errorMessage), 'invalid api key')) {
            throw new AuthenticationException(
                'Invalid or unauthorized Groq API key: ' . $errorMessage,
                ['status' => $statusCode, 'error' => $errorBody]
            );
        }

        if ($statusCode === 429 || str_contains(strtolower($errorMessage), 'rate limit') || str_contains(strtolower($errorType), 'rate_limit')) {
            $retryAfter = (int) ($response->header('Retry-After') ?: 60);
            throw new RateLimitException(
                'Groq rate limit reached: ' . $errorMessage,
                $retryAfter,
                ['status' => $statusCode, 'error' => $errorBody]
            );
        }

        if ($statusCode === 402 || str_contains(strtolower($errorMessage), 'quota') || str_contains(strtolower($errorMessage), 'insufficient_quota')) {
            throw new QuotaExceededException(
                'Groq API quota depleted: ' . $errorMessage,
                ['status' => $statusCode, 'error' => $errorBody]
            );
        }

        if (in_array($statusCode, [500, 502, 503, 504], true)) {
            throw new TransientProviderException(
                'Groq service temporarily unavailable (HTTP ' . $statusCode . '): ' . $errorMessage,
                $statusCode,
                ['status' => $statusCode, 'error' => $errorBody]
            );
        }

        throw new AIProviderException(
            'Groq API returned an unexpected error (HTTP ' . $statusCode . '): ' . $errorMessage,
            $statusCode,
            null,
            ['status' => $statusCode, 'error' => $errorBody]
        );
    }

    /**
     * Test whether an API key is valid with a minimal test completion.
     */
    public function validateKey(string $apiKey): bool
    {
        $testRequest = new AIRequest(
            userPrompt: 'Ping test. Reply with OK.',
            maxTokens: 5,
            temperature: 0.0
        );

        try {
            $response = $this->generate($testRequest, $apiKey);
            return !empty($response->content);
        } catch (AuthenticationException) {
            return false;
        } catch (Throwable $e) {
            Log::info('Groq key test warning: ' . $e->getMessage());
            // If rate limited or transient, the key itself was accepted
            return !($e instanceof AuthenticationException);
        }
    }
}
