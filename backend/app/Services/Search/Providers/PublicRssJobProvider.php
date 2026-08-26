<?php

namespace App\Services\Search\Providers;

use App\Contracts\SearchProviderInterface;
use App\Services\Search\JobExtractionService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PublicRssJobProvider implements SearchProviderInterface
{
    protected JobExtractionService $extractor;

    public function __construct(JobExtractionService $extractor)
    {
        $this->extractor = $extractor;
    }

    public function getProviderId(): string
    {
        return 'weworkremotely_rss';
    }

    public function discoverJobs(array $keywords, ?string $location = null): array
    {
        $jobs = [];
        $userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        $feeds = [
            'https://weworkremotely.com/categories/remote-full-stack-programming-jobs.rss',
            'https://weworkremotely.com/categories/remote-back-end-programming-jobs.rss',
            'https://weworkremotely.com/categories/remote-front-end-programming-jobs.rss',
            'https://weworkremotely.com/categories/remote-programming-jobs.rss',
            'https://weworkremotely.com/remote-jobs.rss',
        ];
        
        foreach ($feeds as $url) {
            try {
                $response = Http::timeout(15)
                    ->withoutVerifying()
                    ->withHeaders(['User-Agent' => $userAgent])
                    ->get($url);
                
                if (!$response->successful()) {
                    Log::warning("PublicRssJobProvider failed to fetch from $url");
                    continue;
                }

                $xml = @simplexml_load_string($response->body(), 'SimpleXMLElement', LIBXML_NOCDATA);
                if (!$xml || !isset($xml->channel->item)) {
                    continue;
                }

                foreach ($xml->channel->item as $item) {
                    $rawTitle = (string) $item->title;
                    $description = (string) $item->description;
                    $link = (string) $item->link;
                    $pubDate = (string) $item->pubDate;
                    
                    $company = 'Company';
                    $title = $rawTitle;
                    if (str_contains($rawTitle, ':')) {
                        $parts = explode(':', $rawTitle, 2);
                        $company = trim($parts[0]);
                        $title = trim($parts[1]);
                    }

                    // Keyword matching if keywords provided
                    $matches = empty($keywords);
                    if (!empty($keywords)) {
                        foreach ($keywords as $keyword) {
                            if (empty($keyword)) continue;
                            if (stripos($rawTitle, $keyword) !== false || stripos($description, $keyword) !== false) {
                                $matches = true;
                                break;
                            }
                        }
                    }

                    if ($matches) {
                        $cleanDesc = $this->extractor->extractCleanText($description);
                        $skills = $this->extractor->extractSkillsFromText($cleanDesc);

                        // Extract location from title parentheses if present, e.g. "Engineer (USA Only)"
                        $loc = 'Remote';
                        if (preg_match('/\(([^)]+)\)$/', $rawTitle, $locMatch)) {
                            $loc = trim($locMatch[1]);
                            $title = trim(preg_replace('/\(([^)]+)\)$/', '', $title));
                        }
                        if (isset($item->region) && !empty((string) $item->region)) {
                            $loc = (string) $item->region;
                        }

                        // Work mode detection
                        $workMode = 'remote';
                        if (stripos($loc, 'hybrid') !== false || stripos($rawTitle, 'hybrid') !== false) {
                            $workMode = 'hybrid';
                        } elseif (stripos($loc, 'on-site') !== false || stripos($loc, 'onsite') !== false) {
                            $workMode = 'onsite';
                        }

                        $jobs[] = [
                            'provider_id' => $this->getProviderId(),
                            'external_id' => md5($link),
                            'title' => $title,
                            'company' => $company,
                            'location' => $loc ?: 'Remote',
                            'work_mode' => $workMode,
                            'employment_type' => 'full-time',
                            'description' => $cleanDesc,
                            'skills_required' => $skills,
                            'url' => $link,
                            'salary' => null,
                            'posted_at' => date('Y-m-d H:i:s', strtotime($pubDate) ?: time()),
                        ];
                    }
                }
            } catch (\Exception $e) {
                Log::error("PublicRssJobProvider exception for $url: " . $e->getMessage());
            }
        }

        return $jobs;
    }
}