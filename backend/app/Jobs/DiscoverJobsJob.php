<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Services\Search\JobDiscoveryService;
use App\Services\Search\Providers\PublicRssJobProvider;
use Illuminate\Support\Facades\Log;

class DiscoverJobsJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected array $keywords = ['software', 'developer', 'engineer', 'laravel', 'react', 'fullstack', 'frontend', 'backend'],
        protected ?string $location = null
    ) {}

    public function handle(JobDiscoveryService $discoveryService): void
    {
        Log::info("Starting DiscoverJobsJob with keywords: " . implode(',', $this->keywords));
        
        $count = $discoveryService->discoverAndSaveJobs($this->keywords, $this->location);
        
        Log::info("DiscoverJobsJob completed. Found and saved {$count} new jobs.");
    }
}
