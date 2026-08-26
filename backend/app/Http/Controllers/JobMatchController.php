<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\JobMatch;
use App\Models\JobPosting;
use App\Models\Resume;
use App\Services\AI\JobMatchingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobMatchController extends Controller
{
    public function __construct(
        protected JobMatchingService $matchingService
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

        $resumeText = null;
        if ($resumeId) {
            $resume = $user->resumes()->find($resumeId);
            if ($resume && !empty($resume->content)) {
                $resumeText = is_string($resume->content) ? $resume->content : json_encode($resume->content);
            }
        }

        $results = [];

        if ($jobPostingId) {
            $posting = JobPosting::findOrFail($jobPostingId);
            $match = $this->matchingService->evaluateMatch($user, $posting, $resumeText);
            $match->load(['posting.links']);
            $results[] = $match;
        } else {
            // Match against top active job postings (up to 10 for performance and token budget)
            $postings = JobPosting::where('is_active', true)->latest()->take(10)->get();
            foreach ($postings as $posting) {
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
