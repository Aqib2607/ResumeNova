<?php

declare(strict_types=1);

namespace App\Contracts;

use App\DTOs\AIRequest;
use App\DTOs\AIProviderResponse;

interface AIProviderInterface
{
    /**
     * Generate content from an AI request using the provided API key.
     *
     * @param AIRequest $request
     * @param string $apiKey
     * @return AIProviderResponse
     * @throws \App\Exceptions\AI\AIProviderException
     */
    public function generate(AIRequest $request, string $apiKey): AIProviderResponse;

    /**
     * Validate whether an API key is operational against the provider.
     *
     * @param string $apiKey
     * @return bool
     */
    public function validateKey(string $apiKey): bool;

    /**
     * Get the identifier for this provider.
     *
     * @return string
     */
    public function getProviderName(): string;
}
