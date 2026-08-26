<?php

namespace App\Services\Search\Providers;

use App\Contracts\SearchProviderInterface;
use App\Services\Search\JobExtractionService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class JobicyJobProvider implements SearchProviderInterface
{
    protected JobExtractionService $extractor;

    public function __construct(JobExtractionService $extractor)
    {
        $this->extractor = $extractor;
    }

    public function getProviderId(): string
    {
        return 'jobicy_remote_api';
    }

    public function discoverJobs(array $keywords, ?string $location = null): array
    {
        $jobs = [];
        $tags = ['fullstack', 'backend', 'php', 'laravel', 'react', 'javascript', 'software', 'developer'];
        
        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

        foreach ($tags as $tag) {
            try {
                $response = Http::timeout(10)
                    ->withoutVerifying()
                    ->withHeaders(['User-Agent' => $userAgent])
                    ->get('https://jobicy.com/api/v2/remote-jobs', [
                        'count' => 20,
                        'tag' => $tag,
                    ]);

                if (!$response->successful()) {
                    continue;
                }

                $data = $response->json();
                $items = $data['jobs'] ?? [];

                foreach ($items as $item) {
                    $title = trim((string) ($item['jobTitle'] ?? 'Software Engineer'));
                    $company = trim((string) ($item['companyName'] ?? 'Company'));
                    $rawDesc = (string) ($item['jobDescription'] ?? '');
                    $url = trim((string) ($item['url'] ?? ''));
                    $geo = trim((string) ($item['jobGeo'] ?? 'Worldwide'));
                    $jobType = trim((string) ($item['jobType'] ?? 'Full-Time'));
                    $pubDate = (string) ($item['pubDate'] ?? now()->toIso8601String());

                    if (empty($url) || empty($title)) {
                        continue;
                    }

                    $cleanDesc = $this->extractor->extractCleanText($rawDesc);
                    $skills = $this->extractor->extractSkills($title . ' ' . $cleanDesc);

                    $workMode = 'remote';
                    $employmentType = 'full-time';
                    if (stripos($jobType, 'contract') !== false || stripos($jobType, 'freelance') !== false) {
                        $employmentType = 'contract';
                    } elseif (stripos($jobType, 'part') !== false) {
                        $employmentType = 'part-time';
                    } elseif (stripos($jobType, 'intern') !== false) {
                        $employmentType = 'internship';
                    }

                    $loc = !empty($geo) && $geo !== 'Anywhere' ? "Remote ({$geo})" : "Worldwide / Remote";

                    $jobs[] = [
                        'provider_id' => $this->getProviderId(),
                        'external_id' => 'jobicy_' . ($item['id'] ?? md5($company . '_' . $title)),
                        'title' => $title,
                        'company' => $company,
                        'location' => $loc,
                        'work_mode' => $workMode,
                        'employment_type' => $employmentType,
                        'salary' => !empty($item['annualSalaryMin']) ? "{$item['salaryCurrency']} {$item['annualSalaryMin']} - {$item['annualSalaryMax']}" : null,
                        'description' => $cleanDesc,
                        'skills_required' => $skills,
                        'url' => $url,
                        'posted_at' => date('Y-m-d H:i:s', strtotime($pubDate) ?: time()),
                    ];
                }
            } catch (\Exception $e) {
                Log::warning("JobicyJobProvider error on tag '{$tag}': " . $e->getMessage());
            }
        }

        return $jobs;
    }
}
