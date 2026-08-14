<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\AtsAnalysisResource;
use App\Models\AtsAnalysis;
use App\Models\Resume;
use App\Services\AI\AtsAnalyzerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class AtsController extends Controller
{
    public function __construct(
        protected AtsAnalyzerService $analyzerService
    ) {}

    /**
     * Run hybrid ATS keyword + semantic analysis on a resume.
     */
    public function analyze(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'resume_id' => ['required', 'exists:resumes,id'],
            'job_description' => ['required', 'string', 'min:10', 'max:20000'],
        ]);

        $resume = Resume::findOrFail($validated['resume_id']);
        Gate::authorize('view', $resume);

        $analysis = $this->analyzerService->analyze(
            $request->user(),
            $resume,
            $validated['job_description']
        );

        return (new AtsAnalysisResource($analysis))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Get paginated ATS analysis history for the authenticated user.
     */
    public function history(Request $request): AnonymousResourceCollection
    {
        $analyses = AtsAnalysis::where('user_id', $request->user()->id)
            ->latest()
            ->paginate((int) $request->input('per_page', 10));

        return AtsAnalysisResource::collection($analyses);
    }

    /**
     * Get a specific ATS analysis record.
     */
    public function show(Request $request, AtsAnalysis $analysis): AtsAnalysisResource
    {
        if ($analysis->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to ATS analysis.');
        }

        return new AtsAnalysisResource($analysis);
    }

    /**
     * Delete an ATS analysis record.
     */
    public function destroy(Request $request, AtsAnalysis $analysis): JsonResponse
    {
        if ($analysis->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to ATS analysis.');
        }

        $analysis->delete();

        return response()->json(['message' => 'ATS analysis deleted.']);
    }
}
