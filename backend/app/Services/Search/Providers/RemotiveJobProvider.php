<?php

namespace App\Services\Search\Providers;

use App\Contracts\SearchProviderInterface;
use App\Services\Search\JobExtractionService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class RemotiveJobProvider implements SearchProviderInterface
{
    protected JobExtractionService $extractor;

    public function __construct(JobExtractionService $extractor)
    {
        $this->extractor = $extractor;
    }

    public function getProviderId(): string
    {
        return 'remotive_public_api';
    }

    public function discoverJobs(array $keywords, ?string $location = null): array
    {
        $jobs = [];
        $searchQuery = implode(' ', array_slice($keywords, 0, 5));
        
        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        $url = 'https://remotive.com/api/remote-jobs';
        
        $params = ['limit' => 50];
        if (!empty($searchQuery)) {
            $params['search'] = $searchQuery;
        }

        try {
            $response = Http::timeout(15)
                ->withoutVerifying()
                ->withHeaders(['User-Agent' => $userAgent])
                ->get($url, $params);

            if (!$response->successful() || empty($response->json()['jobs'])) {
                // Fall back to general software-dev category if query returned no results
                $response = Http::timeout(15)
                    ->withoutVerifying()
                    ->withHeaders(['User-Agent' => $userAgent])
                    ->get($url, ['category' => 'software-dev', 'limit' => 50]);
            }

            if (!$response->successful()) {
                Log::warning("RemotiveJobProvider failed to fetch: HTTP " . $response->status());
                return [];
            }

            $data = $response->json();
            $items = $data['jobs'] ?? [];

            foreach ($items as $item) {
                $title = (string) ($item['title'] ?? 'Software Engineer');
                $company = (string) ($item['company_name'] ?? 'Company');
                $description = (string) ($item['description'] ?? '');
                $link = (string) ($item['url'] ?? '');
                $tags = is_array($item['tags'] ?? null) ? $item['tags'] : [];
                $jobType = (string) ($item['job_type'] ?? 'full_time');
                $loc = (string) ($item['candidate_required_location'] ?? 'Remote');
                $pubDate = (string) ($item['publication_date'] ?? now()->toIso8601String());

                // Parse employment type
                $employmentType = 'full-time';
                if (stripos($jobType, 'contract') !== false) {
                    $employmentType = 'contract';
                } elseif (stripos($jobType, 'part_time') !== false || stripos($jobType, 'part-time') !== false) {
                    $employmentType = 'part-time';
                } elseif (stripos($jobType, 'intern') !== false) {
                    $employmentType = 'internship';
                }

                $cleanDesc = $this->extractor->extractCleanText($description);
                if (empty($tags)) {
                    $tags = $this->extractor->extractSkillsFromText($cleanDesc);
                }

                // Work mode detection
                $workMode = 'remote';
                if (stripos($loc, 'hybrid') !== false || stripos($title, 'hybrid') !== false) {
                    $workMode = 'hybrid';
                } elseif (stripos($loc, 'on-site') !== false || stripos($loc, 'onsite') !== false) {
                    $workMode = 'onsite';
                }

                $jobs[] = [
                    'provider_id' => $this->getProviderId(),
                    'external_id' => (string) ($item['id'] ?? md5($link)),
                    'title' => $title,
                    'company' => $company,
                    'location' => $loc ?: 'Remote',
                    'work_mode' => $workMode,
                    'employment_type' => $employmentType,
                    'description' => $cleanDesc,
                    'skills_required' => $tags,
                    'url' => $link,
                    'salary' => $item['salary'] ?? null,
                    'posted_at' => date('Y-m-d H:i:s', strtotime($pubDate) ?: time()),
                ];
            }
        } catch (\Exception $e) {
            Log::error("RemotiveJobProvider exception: " . $e->getMessage());
        }

        return $jobs;
    }
}
