<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\JobPosting;
use App\Services\Search\JobDiscoveryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobPostingController extends Controller
{
    public function __construct(
        protected JobDiscoveryService $discoveryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = JobPosting::with(['links'])
            ->where('is_active', true);

        if ($request->filled('q')) {
            $searchTerm = trim($request->query('q'));
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('company', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->filled('location')) {
            $loc = trim($request->query('location'));
            $query->where('location', 'like', "%{$loc}%");
        }

        if ($request->filled('work_mode') && $request->query('work_mode') !== 'all') {
            $query->where('work_mode', $request->query('work_mode'));
        }

        if ($request->filled('employment_type') && $request->query('employment_type') !== 'all') {
            $query->where('employment_type', $request->query('employment_type'));
        }

        // If user is authenticated, we can eager load their match and saved state
        $user = $request->user();
        if ($user) {
            $query->with([
                'matches' => function ($m) use ($user) {
                    $m->where('user_id', $user->id);
                },
                'saves' => function ($s) use ($user) {
                    $s->where('user_id', $user->id);
                },
                'applications' => function ($a) use ($user) {
                    $a->where('user_id', $user->id);
                },
            ]);
        }

        $perPage = min(50, max(5, (int) $request->query('per_page', 20)));
        $postings = $query->orderBy('posted_at', 'desc')->paginate($perPage);

        return response()->json($postings);
    }

    public function discover(Request $request): JsonResponse
    {
        $user = $request->user();
        $keywords = [];
        $location = $request->input('location');

        if ($request->filled('keywords')) {
            $raw = $request->input('keywords');
            $keywords = is_array($raw) ? $raw : explode(',', (string) $raw);
        } elseif ($request->filled('q')) {
            $keywords = explode(' ', (string) $request->input('q'));
        } elseif ($user) {
            // 1. Inspect user job preferences first
            $preference = $user->jobPreferences()->where('is_active', true)->first();
            if ($preference) {
                if (!empty($preference->titles) && is_array($preference->titles)) {
                    $keywords = array_merge($keywords, $preference->titles);
                }
                if (!empty($preference->skills) && is_array($preference->skills)) {
                    $keywords = array_merge($keywords, $preference->skills);
                }
                if (empty($location) && !empty($preference->locations)) {
                    $location = is_array($preference->locations) ? implode(',', $preference->locations) : (string) $preference->locations;
                }
            }

            // 2. Extract from user's latest resume skills or candidate skills
            if (empty($keywords)) {
                $latestResume = $user->resumes()->latest()->first();
                if ($latestResume && !empty($latestResume->content['skill_groups'])) {
                    foreach ($latestResume->content['skill_groups'] as $group) {
                        if (!empty($group['skills']) && is_array($group['skills'])) {
                            $keywords = array_merge($keywords, $group['skills']);
                        }
                    }
                }
            }
            if (empty($keywords)) {
                $keywords = $user->candidateSkills()->pluck('name')->toArray();
            }
        }

        // Clean keywords
        $keywords = array_filter(array_map('trim', $keywords));

        $newCount = $this->discoveryService->discoverAndSaveJobs($keywords, $location);

        return response()->json([
            'message' => "Job discovery complete. Found and indexed new opportunities.",
            'new_jobs_count' => $newCount,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'work_mode' => 'nullable|string|in:remote,hybrid,onsite',
            'employment_type' => 'nullable|string|in:full-time,part-time,contract,freelance,internship',
            'min_salary' => 'nullable|numeric|min:0',
            'max_salary' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'description' => 'required|string',
            'skills_required' => 'nullable|array',
            'posted_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
            'url' => 'nullable|string|url',
        ]);

        $hash = sha1(strtolower(trim($validated['company'] . ' ' . $validated['title'])));
        $validated['normalization_hash'] = $hash;

        $posting = JobPosting::create($validated);

        if (!empty($validated['url'])) {
            $posting->links()->create([
                'url' => $validated['url'],
                'provider_type' => 'manual',
                'clicks' => 0,
            ]);
        }

        return response()->json($posting, 201);
    }

    public function show(string $id): JsonResponse
    {
        $posting = JobPosting::with(['links'])->findOrFail($id);
        return response()->json($posting);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $posting = JobPosting::findOrFail($id);

        $validated = $request->validate([
            'title' => 'string|max:255',
            'company' => 'string|max:255',
            'location' => 'nullable|string|max:255',
            'work_mode' => 'nullable|string|in:remote,hybrid,onsite',
            'employment_type' => 'nullable|string|in:full-time,part-time,contract,freelance,internship',
            'min_salary' => 'nullable|numeric|min:0',
            'max_salary' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:10',
            'description' => 'string',
            'skills_required' => 'nullable|array',
            'posted_at' => 'nullable|date',
            'expires_at' => 'nullable|date',
            'is_active' => 'boolean',
        ]);

        $posting->update($validated);
        return response()->json($posting);
    }

    public function destroy(string $id): JsonResponse
    {
        $posting = JobPosting::findOrFail($id);
        $posting->delete();

        return response()->json(null, 204);
    }
}
