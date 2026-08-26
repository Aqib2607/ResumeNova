<?php

namespace App\Contracts;

interface SearchProviderInterface
{
    /**
     * Get a unique identifier for the provider.
     *
     * @return string
     */
    public function getProviderId(): string;

    /**
     * Discover jobs based on a set of keywords and an optional location.
     *
     * @param array $keywords
     * @param string|null $location
     * @return array
     */
    public function discoverJobs(array $keywords, ?string $location = null): array;
}
