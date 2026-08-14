<?php

declare(strict_types=1);

namespace App\Exceptions\AI;

class AuthenticationException extends AIProviderException
{
    public function __construct(
        string $message = 'Invalid or unauthorized AI provider API key.',
        array $context = []
    ) {
        parent::__construct($message, 401, null, $context);
    }
}
