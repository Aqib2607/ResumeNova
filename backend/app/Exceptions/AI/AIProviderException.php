<?php

declare(strict_types=1);

namespace App\Exceptions\AI;

use Exception;
use Throwable;

class AIProviderException extends Exception
{
    public function __construct(
        string $message = 'An AI provider error occurred.',
        int $code = 500,
        ?Throwable $previous = null,
        public readonly array $context = []
    ) {
        parent::__construct($message, $code, $previous);
    }
}
