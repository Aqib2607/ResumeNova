<?php

declare(strict_types=1);

namespace App\Services\Search;

use App\Contracts\SearchProviderInterface;
use App\Models\JobLink;
use App\Models\JobPosting;
use App\Models\JobSource;
use App\Services\Search\Providers\PublicRssJobProvider;
use App\Services\Search\Providers\RemotiveJobProvider;
use Illuminate\Support\Facades\Log;

class JobDiscoveryService
{
    /** @var SearchProviderInterface[] */
    protected array $providers = [];

    public function __construct(
        JobExtractionService $extractor
    ) {
        $this->registerProvider(new RemotiveJobProvider($extractor));
        $this->registerProvider(new PublicRssJobProvider($extractor));
    }

    public function registerProvider(SearchProviderInterface $provider): void
    {
        $this->providers[] = $provider;
    }

    /**
     * Discovers and saves jobs from all registered providers.
     *
     * @param array $keywords
     * @param string|null $location
     * @return int Number of new jobs inserted.
     */
    public function discoverAndSaveJobs(array $keywords = [], ?string $location = null): int
    {
        $newJobsCount = 0;

        foreach ($this->providers as $provider) {
            try {
                $jobs = $provider->discoverJobs($keywords, $location);

                $source = JobSource::firstOrCreate(
                    ['name' => $provider->getProviderId()],
                    [
                        'provider_type' => $provider->getProviderId(),
                        'base_url' => 'https://' . $provider->getProviderId(),
                        'is_active' => true,
                    ]
                );

                foreach ($jobs as $jobData) {
                    $company = trim((string) ($jobData['company'] ?? 'Unknown Company'));
                    $title = trim((string) ($jobData['title'] ?? 'Software Position'));
                    $hash = sha1(strtolower($company . ' ' . $title));

                    $existing = JobPosting::where('normalization_hash', $hash)->first();

                    if (!$existing) {
                        $posting = JobPosting::create([
                            'title' => $title,
                            'company' => $company,
                            'location' => $jobData['location'] ?? 'Remote',
                            'work_mode' => $jobData['work_mode'] ?? 'remote',
                            'employment_type' => $jobData['employment_type'] ?? 'full-time',
                            'description' => $jobData['description'] ?? '',
                            'skills_required' => $jobData['skills_required'] ?? [],
                            'normalization_hash' => $hash,
                            'posted_at' => $jobData['posted_at'] ?? now(),
                            'expires_at' => now()->addDays(30),
                            'is_active' => true,
                        ]);

                        if (!empty($jobData['url'])) {
                            JobLink::create([
                                'job_posting_id' => $posting->id,
                                'url' => $jobData['url'],
                                'provider_type' => $provider->getProviderId(),
                                'clicks' => 0,
                            ]);
                        }

                        $newJobsCount++;
                    } else {
                        // If link doesn't exist for this posting, add it
                        if (!empty($jobData['url'])) {
                            JobLink::firstOrCreate(
                                [
                                    'job_posting_id' => $existing->id,
                                    'url' => $jobData['url'],
                                ],
                                [
                                    'provider_type' => $provider->getProviderId(),
                                    'clicks' => 0,
                                ]
                            );
                        }
                    }
                }
            } catch (\Exception $e) {
                Log::error("Failed discovering jobs for provider: " . $provider->getProviderId(), [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $newJobsCount;
    }
}
