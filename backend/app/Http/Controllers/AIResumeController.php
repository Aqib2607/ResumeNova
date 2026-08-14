<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Resume;
use App\Services\AI\AIResumeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AIResumeController extends Controller
{
    public function __construct(
        protected AIResumeService $aiResumeService
    ) {}

    /**
     * Generate or enhance professional summary for a resume.
     */
    public function summary(Request $request, Resume $resume): JsonResponse
    {
        Gate::authorize('update', $resume);

        $validated = $request->validate([
            'language' => ['nullable', 'string', 'in:en,bn,es,fr,de'],
            'target_role' => ['nullable', 'string', 'max:255'],
            'current_summary' => ['nullable', 'string', 'max:5000'],
            'persist' => ['nullable', 'boolean'],
        ]);

        $result = $this->aiResumeService->generateSummary($resume, $request->user(), $validated);

        return response()->json($result);
    }

    /**
     * Improve experience bullet points.
     */
    public function experience(Request $request, Resume $resume): JsonResponse
    {
        Gate::authorize('update', $resume);

        $validated = $request->validate([
            'role' => ['nullable', 'string', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'bullets' => ['required'],
            'language' => ['nullable', 'string', 'in:en,bn,es,fr,de'],
            'job_description' => ['nullable', 'string', 'max:10000'],
        ]);

        $result = $this->aiResumeService->improveExperience($resume, $request->user(), $validated);

        return response()->json($result);
    }

    /**
     * Improve project description.
     */
    public function project(Request $request, Resume $resume): JsonResponse
    {
        Gate::authorize('update', $resume);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'technologies' => ['nullable', 'array'],
            'language' => ['nullable', 'string', 'in:en,bn,es,fr,de'],
        ]);

        $result = $this->aiResumeService->improveProject($resume, $request->user(), $validated);

        return response()->json($result);
    }

    /**
     * Suggest skills tailored to the resume.
     */
    public function skills(Request $request, Resume $resume): JsonResponse
    {
        Gate::authorize('update', $resume);

        $validated = $request->validate([
            'language' => ['nullable', 'string', 'in:en,bn,es,fr,de'],
            'job_description' => ['nullable', 'string', 'max:10000'],
        ]);

        $result = $this->aiResumeService->suggestSkills($resume, $request->user(), $validated);

        return response()->json($result);
    }
}
