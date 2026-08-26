<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\JobMatch;
use App\Models\JobPosting;
use App\Models\Resume;
use App\Services\AI\JobMatchingService;
use App\Services\Search\JobDiscoveryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobMatchController extends Controller
{
    public function __construct(
        protected JobMatchingService $matchingService,
        protected JobDiscoveryService $discoveryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $matches = $user->jobMatches()
            ->with(['posting.links'])
            ->where('is_dismissed', false)
            ->orderBy('match_score', 'desc')
            ->get();

        return response()->json($matches);
    }

    public function match(Request $request): JsonResponse
    {
        $user = $request->user();
        $resumeId = $request->input('resume_id');
        $jobPostingId = $request->input('job_posting_id');

        // Auto-discover if database has 0 active postings
        if (JobPosting::where('is_active', true)->count() === 0) {
            try {
                $this->discoveryService->discoverAndSaveJobs(['developer', 'software', 'engineer', 'full stack']);
            } catch (\Exception $e) {
                // Silently continue
            }
        }

        $resumeText = null;
        $resumeSkills = [];
        $resumeTitles = [];

        if ($resumeId) {
            $resume = $user->resumes()->find($resumeId);
            if ($resume && !empty($resume->content)) {
                $content = $resume->content;
                $resumeText = is_string($content) ? $content : json_encode($content);

                if (is_array($content)) {
                    if (!empty($content['skill_groups'])) {
                        foreach ($content['skill_groups'] as $group) {
                            if (!empty($group['skills']) && is_array($group['skills'])) {
                                $resumeSkills = array_merge($resumeSkills, $group['skills']);
                            }
                        }
                    }
                    if (!empty($content['experience'])) {
                        foreach ($content['experience'] as $exp) {
                            if (!empty($exp['position'])) {
                                $resumeTitles[] = $exp['position'];
                            }
                        }
                    }
                    if (!empty($content['basics']['title'])) {
                        $resumeTitles[] = $content['basics']['title'];
                    }
                }
            }
        }

        $userCity = 'Khulna';
        $userCountry = 'Bangladesh';
        if (!empty($content['basics']['location'])) {
            $locStr = (string) $content['basics']['location'];
            $parts = array_map('trim', explode(',', $locStr));
            if (count($parts) >= 2) {
                $userCity = $parts[0];
                $userCountry = $parts[count($parts) - 1];
            } else {
                $userCity = $locStr;
                $userCountry = $locStr;
            }
        }

        $results = [];

        if ($jobPostingId) {
            $posting = JobPosting::findOrFail($jobPostingId);
            $match = $this->matchingService->evaluateMatch($user, $posting, $resumeText);
            $match->load(['posting.links']);
            $results[] = $match;
        } else {
            // Extract candidate skills & target titles
            $coreSkills = array_filter($resumeSkills, fn($s) => strlen(trim((string)$s)) >= 2);
            $techTitles = ['developer', 'engineer', 'full stack', 'fullstack', 'backend', 'web', 'php', 'laravel', 'react', 'typescript', 'software'];
            $userSkillsLower = array_map('strtolower', $coreSkills);

            // Fetch candidate pool of active postings
            $candidatePool = JobPosting::with('links')->where('is_active', true)->get();

            $scoredPool = [];
            foreach ($candidatePool as $posting) {
                $relScore = 0;
                $titleLower = strtolower($posting->title);
                $descLower = strtolower($posting->description);
                $skills = is_array($posting->skills_required) ? $posting->skills_required : [];
                $skillsLower = array_map('strtolower', $skills);

                // Title match with candidate target roles
                foreach ($techTitles as $tt) {
                    if (str_contains($titleLower, $tt)) {
                        $relScore += 30;
                    }
                }

                // Direct skill overlap
                foreach ($userSkillsLower as $usk) {
                    if (in_array($usk, $skillsLower) || str_contains($titleLower, $usk)) {
                        $relScore += 25;
                    } elseif (str_contains($descLower, $usk)) {
                        $relScore += 8;
                    }
                }

                // Direct application URL bonus
                if (!empty($posting->url) && (
                    str_contains($posting->url, 'weworkremotely.com/remote-jobs/') ||
                    str_contains($posting->url, 'jobicy.com/jobs/') ||
                    str_contains($posting->url, 'remotive.com/remote-jobs/') ||
                    str_contains($posting->url, 'arbeitnow.com/jobs/') ||
                    str_contains($posting->url, 'apply.workable.com') ||
                    str_contains($posting->url, 'careers.optimizely.com') ||
                    str_contains($posting->url, 'career.cefalo.com')
                )) {
                    $relScore += 15;
                }

                // Location matching bonus (local city/country + worldwide remote)
                $locLower = strtolower($posting->location);
                $cityLower = strtolower($userCity ?: 'khulna');
                $countryLower = strtolower($userCountry ?: 'bangladesh');

                if (str_contains($locLower, $cityLower) || str_contains($locLower, $countryLower) || str_contains($locLower, 'dhaka')) {
                    $relScore += 20;
                } elseif ($posting->work_mode === 'remote' || str_contains($locLower, 'remote') || str_contains($locLower, 'worldwide') || str_contains($locLower, 'anywhere') || str_contains($locLower, 'global')) {
                    $relScore += 15;
                }

                // Penalty for unrelated job domains
                $unrelated = ['graphic designer', 'copywriter', 'content reviewer', 'sales contractor', 'financial accountant', 'assistant', 'intern', 'ruby on rails'];
                foreach ($unrelated as $un) {
                    if (str_contains($titleLower, $un)) {
                        $relScore -= 50;
                    }
                }

                $scoredPool[] = [
                    'posting' => $posting,
                    'relevance' => $relScore,
                ];
            }

            // Sort by highest relevance score
            usort($scoredPool, fn($a, $b) => $b['relevance'] <=> $a['relevance']);

            // Pick top 6 distinct candidate postings
            $selectedPostings = array_map(fn($item) => $item['posting'], array_slice($scoredPool, 0, 6));

            foreach ($selectedPostings as $posting) {
                $match = $this->matchingService->evaluateMatch($user, $posting, $resumeText);
                $match->load(['posting.links']);
                $results[] = $match;
            }
        }

        // Sort descending by score
        usort($results, fn($a, $b) => $b->match_score <=> $a->match_score);

        return response()->json([
            'message' => 'Smart Match evaluation complete.',
            'matches' => $results,
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $match = $request->user()->jobMatches()->with(['posting.links'])->findOrFail($id);
        return response()->json($match);
    }

    public function dismiss(Request $request, string $id): JsonResponse
    {
        $match = $request->user()->jobMatches()->findOrFail($id);
        $match->update(['is_dismissed' => true]);

        return response()->json(['message' => 'Match dismissed.']);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $match = $request->user()->jobMatches()->findOrFail($id);
        $match->delete();

        return response()->json(null, 204);
    }
}
