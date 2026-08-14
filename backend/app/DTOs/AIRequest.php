<?php

declare(strict_types=1);

namespace App\DTOs;

class AIRequest
{
    /**
     * @param string $userPrompt
     * @param string|null $systemPrompt
     * @param string|null $model
     * @param float $temperature
     * @param int $maxTokens
     * @param string|null $responseFormat 'json_object' | 'text' | null
     * @param array<string, mixed> $metadata
     */
    public function __construct(
        public readonly string $userPrompt,
        public readonly ?string $systemPrompt = null,
        public readonly ?string $model = null,
        public readonly float $temperature = 0.7,
        public readonly int $maxTokens = 4096,
        public readonly ?string $responseFormat = null,
        public readonly array $metadata = []
    ) {}

    /**
     * Format into standard chat completion messages array.
     *
     * @return array<int, array{role: string, content: string}>
     */
    public function toMessages(): array
    {
        $messages = [];

        if (!empty($this->systemPrompt)) {
            $messages[] = [
                'role' => 'system',
                'content' => $this->systemPrompt,
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => $this->userPrompt,
        ];

        return $messages;
    }
}
