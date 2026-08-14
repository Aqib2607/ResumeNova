<?php

declare(strict_types=1);

namespace App\Exceptions\AI;

class AllKeysExhaustedException extends AIProviderException
{
    public function __construct(
        string $message = 'All configured AI API keys are currently rate-limited, depleted, or unavailable.',
        array $context = []
    ) {
        parent::__construct($message, 429, null, $context);
    }
}
