<?php

declare(strict_types=1);

namespace App\Exceptions\AI;

class TransientProviderException extends AIProviderException
{
    public function __construct(
        string $message = 'Transient AI provider communication failure.',
        int $code = 503,
        array $context = []
    ) {
        parent::__construct($message, $code, null, $context);
    }
}
