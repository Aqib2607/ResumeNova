<?php

declare(strict_types=1);

namespace App\Exceptions\AI;

class RateLimitException extends AIProviderException
{
    public function __construct(
        string $message = 'AI provider rate limit exceeded.',
        public readonly int $retryAfterSeconds = 60,
        array $context = []
    ) {
        parent::__construct($message, 429, null, $context);
    }
}
