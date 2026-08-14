<?php

declare(strict_types=1);

namespace App\Exceptions\AI;

class QuotaExceededException extends AIProviderException
{
    public function __construct(
        string $message = 'AI provider quota or usage limit depleted.',
        array $context = []
    ) {
        parent::__construct($message, 402, null, $context);
    }
}
