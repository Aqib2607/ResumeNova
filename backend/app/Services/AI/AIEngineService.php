<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Contracts\AIProviderInterface;
use App\DTOs\AIProviderResponse;
use App\DTOs\AIRequest;
use App\Exceptions\AI\AllKeysExhaustedException;
use App\Exceptions\AI\AuthenticationException;
use App\Exceptions\AI\QuotaExceededException;
use App\Exceptions\AI\RateLimitException;
use App\Exceptions\AI\TransientProviderException;
use App\Models\AiCheckpoint;
use App\Models\AiRequest as AiRequestLog;
use App\Models\ApiKey;
use App\Models\User;
use App\Services\ApiKeyManager;
use Illuminate\Support\Facades\Log;
use Throwable;

class AIEngineService
{
    public function __construct(
        protected AIProviderInterface $provider,
        protected ApiKeyManager $keyManager
    ) {}

    /**
     * Execute an AI request on behalf of a user with automatic key selection, failover, and checkpointing.
     *
     * @param User $user
     * @param AIRequest $request
     * @param string $operationType (e.g. 'resume_summary', 'resume_experience', 'ats_analysis', 'cover_letter')
     * @param int|null $resumeId
     * @param AiCheckpoint|null $existingCheckpoint
     * @return AIProviderResponse
     * @throws AllKeysExhaustedException
     */
    public function execute(
        User $user,
        AIRequest $request,
        string $operationType = 'general',
        ?int $resumeId = null,
        ?AiCheckpoint $existingCheckpoint = null
    ): AIProviderResponse {
        $checkpoint = $existingCheckpoint ?: AiCheckpoint::create([
            'user_id' => $user->id,
            'resume_id' => $resumeId,
            'operation_type' => $operationType,
            'step' => 'execution_started',
            'completed_steps' => [],
            'partial_output' => [],
            'failover_count' => 0,
            'status' => 'in_progress',
        ]);

        $attemptedKeyIds = [];
        $maxAttempts = 5;
        $currentAttempt = 0;

        Log::info("AI request started [User #{$user->id}, Operation: {$operationType}]");

        while ($currentAttempt < $maxAttempts) {
            $currentAttempt++;

            // Select next eligible user key, excluding already failed keys in this run
            /** @var ApiKey|null $activeKey */
            $activeKey = $this->keyManager->getNextEligibleKey(
                $user,
                $this->provider->getProviderName(),
                !empty($attemptedKeyIds) ? end($attemptedKeyIds) : null
            );

            $rawKey = null;
            $keyId = null;

            if ($activeKey) {
                // If this key was already tried in this loop, break to prevent infinite loop
                if (in_array($activeKey->id, $attemptedKeyIds, true)) {
                    break;
                }

                $keyId = $activeKey->id;
                $attemptedKeyIds[] = $keyId;
                $rawKey = $activeKey->key; // Eloquent decrypted value
                Log::info("AI Engine selected Key #{$activeKey->id} (Priority {$activeKey->priority}) for User #{$user->id}");
            } else {
                // Fall back to server-level system key if configured
                $systemKey = config('services.groq.api_key') ?: env('GROQ_API_KEY');
                if (!empty($systemKey) && !in_array('system', $attemptedKeyIds, true)) {
                    $attemptedKeyIds[] = 'system';
                    $rawKey = $systemKey;
                    Log::info("AI Engine falling back to system Groq key for User #{$user->id}");
                } else {
                    break; // No more keys available
                }
            }

            // Update checkpoint with active key
            $checkpoint->update([
                'active_key_id' => is_int($keyId) ? $keyId : null,
                'step' => 'calling_provider',
            ]);

            try {
                $response = $this->provider->generate($request, $rawKey);

                // Success: mark key used and record AI request log
                if ($activeKey) {
                    $activeKey->markUsed();
                }

                $this->recordUsageLog($user, $operationType);

                // Complete checkpoint
                $checkpoint->update([
                    'step' => 'completed',
                    'status' => 'completed',
                    'partial_output' => [
                        'tokens' => $response->usage,
                        'model' => $response->model,
                    ],
                ]);

                Log::info("AI request completed successfully [User #{$user->id}, Operation: {$operationType}, Model: {$response->model}]");

                return $response;
            } catch (RateLimitException $e) {
                Log::warning("AI Key rate limit hit: {$e->getMessage()}. Triggering failover checkpoint.");
                if ($activeKey) {
                    $activeKey->markFailed('Rate limit reached', $e->retryAfterSeconds);
                }
                $this->recordFailoverCheckpoint($checkpoint, $e->getMessage());
            } catch (QuotaExceededException $e) {
                Log::warning("AI Key quota exceeded: {$e->getMessage()}. Triggering failover checkpoint.");
                if ($activeKey) {
                    $activeKey->markFailed('Quota depleted', 3600, true);
                }
                $this->recordFailoverCheckpoint($checkpoint, $e->getMessage());
            } catch (AuthenticationException $e) {
                Log::warning("AI Key auth failed: {$e->getMessage()}. Triggering failover checkpoint.");
                if ($activeKey) {
                    $activeKey->markFailed('Invalid API key', 0, true);
                }
                $this->recordFailoverCheckpoint($checkpoint, $e->getMessage());
            } catch (TransientProviderException $e) {
                Log::warning("AI Provider transient failure: {$e->getMessage()}. Triggering failover checkpoint.");
                if ($activeKey) {
                    $activeKey->markFailed('Transient failure', 30);
                }
                $this->recordFailoverCheckpoint($checkpoint, $e->getMessage());
            } catch (Throwable $e) {
                Log::error("Unexpected AI provider failure: " . $e->getMessage());
                $checkpoint->update(['status' => 'failed', 'step' => 'unexpected_error']);
                throw $e;
            }
        }

        // All keys exhausted
        $checkpoint->update([
            'status' => 'failed',
            'step' => 'all_keys_exhausted',
        ]);

        Log::error("All AI API keys exhausted for User #{$user->id} on operation {$operationType}");
        throw new AllKeysExhaustedException(
            'All configured Groq API keys are currently rate-limited, depleted, or unavailable. Please add or update an API key in your dashboard.'
        );
    }

    /**
     * Record checkpoint state update during a failover event.
     */
    protected function recordFailoverCheckpoint(AiCheckpoint $checkpoint, string $reason): void
    {
        $checkpoint->increment('failover_count');
        $completedSteps = $checkpoint->completed_steps ?? [];
        $completedSteps[] = [
            'timestamp' => now()->toIso8601String(),
            'event' => 'failover',
            'reason' => $reason,
            'previous_key_id' => $checkpoint->active_key_id,
        ];

        $checkpoint->update([
            'step' => 'failing_over',
            'completed_steps' => $completedSteps,
        ]);
    }

    /**
     * Record daily AI requests statistics.
     */
    protected function recordUsageLog(User $user, string $endpoint): void
    {
        try {
            $today = now()->toDateString();
            $log = AiRequestLog::firstOrNew([
                'user_id' => $user->id,
                'endpoint' => $endpoint,
                'date' => $today,
            ]);

            $log->calls = ($log->calls ?? 0) + 1;
            $log->save();
        } catch (Throwable $e) {
            Log::warning('Failed to record AI usage log: ' . $e->getMessage());
        }
    }
}
