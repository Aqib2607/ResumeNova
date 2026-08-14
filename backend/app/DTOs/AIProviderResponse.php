<?php

declare(strict_types=1);

namespace App\DTOs;

class AIProviderResponse
{
    /**
     * @param string $content Raw text response from the provider
     * @param string $model The model that generated the completion
     * @param array<string, mixed> $usage Token usage metrics (prompt_tokens, completion_tokens, total_tokens)
     * @param array<string, mixed>|null $parsedJson Parsed JSON payload if JSON format was requested
     * @param array<string, mixed> $rawResponse Full raw provider response
     */
    public function __construct(
        public readonly string $content,
        public readonly string $model,
        public readonly array $usage = [],
        public readonly ?array $parsedJson = null,
        public readonly array $rawResponse = []
    ) {}

    /**
     * Helper to retrieve parsed structured data or fall back to array from content.
     *
     * @return array<string, mixed>|null
     */
    public function json(): ?array
    {
        if ($this->parsedJson !== null) {
            return $this->parsedJson;
        }

        $decoded = json_decode($this->content, true);

        return is_array($decoded) ? $decoded : null;
    }

    /**
     * Alias for json() structured extraction.
     *
     * @return array<string, mixed>|null
     */
    public function getParsedJson(): ?array
    {
        return $this->json();
    }
}
