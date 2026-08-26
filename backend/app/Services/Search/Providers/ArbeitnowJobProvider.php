<?php

namespace App\Services\Search\Providers;

use App\Contracts\SearchProviderInterface;
use App\Services\Search\JobExtractionService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ArbeitnowJobProvider implements SearchProviderInterface
{
    protected JobExtractionService $extractor;

    public function __construct(JobExtractionService $extractor)
    {
        $this->extractor = $extractor;
    }

    public function getProviderId(): string
    {
        return 'arbeitnow_public_api';
    }

    public function discoverJobs(array $keywords, ?string $location = null): array
    {
        $jobs = [];
        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        $url = 'https://www.arbeitnow.com/api/job-board-api';

        try {
            $response = Http::timeout(15)
                ->withoutVerifying()
                ->withHeaders(['User-Agent' => $userAgent])
                ->get($url);

            if (!$response->successful()) {
                Log::warning("ArbeitnowJobProvider failed to fetch: HTTP " . $response->status());
                return [];
            }

            $data = $response->json();
            $items = $data['data'] ?? [];

            foreach ($items as $item) {
                $title = (string) ($item['title'] ?? 'Software Engineer');
                $company = (string) ($item['company_name'] ?? 'Company');
                $description = (string) ($item['description'] ?? '');
                $link = (string) ($item['url'] ?? '');
                $tags = is_array($item['tags'] ?? null) ? $item['tags'] : [];
                $isRemote = (bool) ($item['remote'] ?? true);
                $loc = (string) ($item['location'] ?? ($isRemote ? 'Remote' : 'On-site'));
                $pubDate = (int) ($item['created_at'] ?? time());

                $cleanDesc = $this->extractor->extractCleanText($description);
                if (empty($tags)) {
                    $tags = $this->extractor->extractSkillsFromText($cleanDesc);
                }

                $jobType = is_array($item['job_types'] ?? null) ? implode(' ', $item['job_types']) : '';
                $employmentType = 'full-time';
                if (stripos($jobType, 'contract') !== false) {
                    $employmentType = 'contract';
                } elseif (stripos($jobType, 'part') !== false) {
                    $employmentType = 'part-time';
                }

                $jobs[] = [
                    'provider_id' => $this->getProviderId(),
                    'external_id' => (string) ($item['slug'] ?? md5($link)),
                    'title' => $title,
                    'company' => $company,
                    'location' => $loc ?: 'Remote',
                    'work_mode' => $isRemote ? 'remote' : 'onsite',
                    'employment_type' => $employmentType,
                    'description' => $cleanDesc,
                    'skills_required' => $tags,
                    'url' => $link,
                    'salary' => null,
                    'posted_at' => date('Y-m-d H:i:s', $pubDate > 0 ? $pubDate : time()),
                ];
            }
        } catch (\Exception $e) {
            Log::error("ArbeitnowJobProvider exception: " . $e->getMessage());
        }

        return $jobs;
    }
}
