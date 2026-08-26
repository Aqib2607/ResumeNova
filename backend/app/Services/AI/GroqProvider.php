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
    protected array $fallbackModels;
    protected int $timeout;
    protected int $maxRetries;
    protected bool $verifySsl;

    public function __construct()
    {
        $this->baseUrl = (string) config('groq.base_url', 'https://api.groq.com/openai/v1');
        $this->defaultModel = (string) config('groq.default_model', 'llama-3.3-70b-versatile');
        $this->fallbackModels = (array) config('groq.fallback_models', [
            'llama-3.3-70b-versatile',
            'llama-3.1-8b-instant',
            'llama3-70b-8192',
            'llama3-8b-8192',
            'mixtral-8x7b-32768',
            'gemma2-9b-it',
        ]);
        $this->timeout = (int) config('groq.timeout', 30);
        $this->maxRetries = (int) config('groq.max_retries', 3);
        $this->verifySsl = (bool) config('groq.verify_ssl', false);
    }

    public function getProviderName(): string
    {
        return 'groq';
    }

    /**
     * Generate content via Groq Chat Completions API with automated model fallback.
     */
    public function generate(AIRequest $request, string $apiKey): AIProviderResponse
    {
        $url = rtrim($this->baseUrl, '/') . '/chat/completions';
        $primaryModel = $request->model ?: $this->defaultModel;

        // Build list of candidate models to try in order
        $candidateModels = [$primaryModel];
        foreach ($this->fallbackModels as $fallbackModel) {
            if (!empty($fallbackModel) && !in_array($fallbackModel, $candidateModels, true)) {
                $candidateModels[] = $fallbackModel;
            }
        }

        $lastException = null;

        foreach ($candidateModels as $modelIndex => $model) {
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
                Log::warning("Groq HTTP connection failure on model {$model}: " . $e->getMessage());
                throw new TransientProviderException(
                    'Failed to communicate with Groq AI service: ' . $e->getMessage(),
                    503,
                    ['error' => $e->getMessage(), 'model' => $model]
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

                if ($modelIndex > 0) {
                    Log::info("Groq successfully completed using fallback model '{$model}' (primary requested: '{$primaryModel}')");
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
            $errorCode = is_array($errorBody) ? ($errorBody['code'] ?? '') : '';

            // Handle Model Not Found / Decommissioned / Deprecated / No Access (HTTP 404 or 400)
            $isModelError = in_array($statusCode, [400, 404], true) && (
                $statusCode === 404 ||
                $errorCode === 'model_not_found' ||
                $errorCode === 'model_decommissioned' ||
                $errorCode === 'model_terms_required' ||
                $errorCode === 'json_validate_failed' ||
                str_contains(strtolower($errorMessage), 'decommissioned') ||
                str_contains(strtolower($errorMessage), 'deprecated') ||
                str_contains(strtolower($errorMessage), 'does not exist') ||
                str_contains(strtolower($errorMessage), 'do not have access') ||
                str_contains(strtolower($errorMessage), 'model_not_found') ||
                str_contains(strtolower($errorMessage), 'model')
            );

            if ($isModelError) {
                // If we are on the last candidate model, attempt dynamic model discovery as last resort
                if ($modelIndex === count($candidateModels) - 1) {
                    $dynamicModels = $this->getAvailableModels($apiKey);
                    foreach ($dynamicModels as $dynModel) {
                        if (!in_array($dynModel, $candidateModels, true)) {
                            $candidateModels[] = $dynModel;
                        }
                    }
                }

                $hasNextCandidate = $modelIndex < count($candidateModels) - 1;
                Log::warning(
                    "Groq model '{$model}' unavailable (HTTP {$statusCode}: {$errorMessage}). " .
                    ($hasNextCandidate ? "Attempting fallback model '{$candidateModels[$modelIndex + 1]}'..." : 'No further fallback models available.')
                );

                $lastException = new AIProviderException(
                    "Groq API returned an unexpected error (HTTP {$statusCode}): {$errorMessage}",
                    $statusCode,
                    null,
                    ['status' => $statusCode, 'error' => $errorBody, 'model' => $model]
                );

                if ($hasNextCandidate) {
                    continue;
                }

                throw $lastException;
            }

            // Classify other Groq Error Responses
            if ($statusCode === 401 || $statusCode === 403 || str_contains(strtolower($errorMessage), 'invalid api key')) {
                throw new AuthenticationException(
                    'Invalid or unauthorized Groq API key: ' . $errorMessage,
                    ['status' => $statusCode, 'error' => $errorBody, 'model' => $model]
                );
            }

            if ($statusCode === 429 || str_contains(strtolower($errorMessage), 'rate limit') || str_contains(strtolower($errorType), 'rate_limit')) {
                $retryAfter = (int) ($response->header('Retry-After') ?: 60);
                throw new RateLimitException(
                    'Groq rate limit reached: ' . $errorMessage,
                    $retryAfter,
                    ['status' => $statusCode, 'error' => $errorBody, 'model' => $model]
                );
            }

            if ($statusCode === 402 || str_contains(strtolower($errorMessage), 'quota') || str_contains(strtolower($errorMessage), 'insufficient_quota')) {
                throw new QuotaExceededException(
                    'Groq API quota depleted: ' . $errorMessage,
                    ['status' => $statusCode, 'error' => $errorBody, 'model' => $model]
                );
            }

            if (in_array($statusCode, [500, 502, 503, 504], true)) {
                throw new TransientProviderException(
                    'Groq service temporarily unavailable (HTTP ' . $statusCode . '): ' . $errorMessage,
                    $statusCode,
                    ['status' => $statusCode, 'error' => $errorBody, 'model' => $model]
                );
            }

            throw new AIProviderException(
                'Groq API returned an unexpected error (HTTP ' . $statusCode . '): ' . $errorMessage,
                $statusCode,
                null,
                ['status' => $statusCode, 'error' => $errorBody, 'model' => $model]
            );
        }

        throw $lastException ?: new AIProviderException('All Groq candidate models failed.', 500);
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

    /**
     * Dynamically retrieve active model IDs available for a given Groq API key.
     *
     * @param string $apiKey
     * @return array<string>
     */
    public function getAvailableModels(string $apiKey): array
    {
        try {
            $url = rtrim($this->baseUrl, '/') . '/models';
            $httpClient = Http::withToken($apiKey)->timeout(10)->acceptJson();
            if (!$this->verifySsl) {
                $httpClient = $httpClient->withoutVerifying();
            }

            $response = $httpClient->get($url);
            if ($response->successful()) {
                $data = $response->json('data') ?? [];
                $models = [];
                foreach ($data as $item) {
                    $id = $item['id'] ?? '';
                    if (
                        $id &&
                        !str_contains($id, 'whisper') &&
                        !str_contains($id, 'prompt-guard') &&
                        !str_contains($id, 'safeguard') &&
                        !str_contains($id, 'tts')
                    ) {
                        $models[] = $id;
                    }
                }
                return $models;
            }
        } catch (Throwable $e) {
            Log::info('Could not fetch Groq dynamic models: ' . $e->getMessage());
        }

        return [];
    }
}
