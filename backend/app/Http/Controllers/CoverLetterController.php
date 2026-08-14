<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\CoverLetterResource;
use App\Models\CoverLetter;
use App\Services\AI\AICoverLetterService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class CoverLetterController extends Controller
{
    public function __construct(
        protected AICoverLetterService $coverLetterService
    ) {}

    /**
     * Display a listing of the user's cover letters.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $letters = CoverLetter::where('user_id', $request->user()->id)
            ->latest()
            ->paginate((int) $request->input('per_page', 10));

        return CoverLetterResource::collection($letters);
    }

    /**
     * Generate a new AI cover letter.
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'resume_id' => ['nullable', 'exists:resumes,id'],
            'job_description' => ['required', 'string', 'min:15', 'max:20000'],
            'language' => ['nullable', 'string', 'in:en,bn,es,fr,de'],
            'tone' => ['nullable', 'string', 'in:professional,confident,conversational,executive'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
        ]);

        $coverLetter = $this->coverLetterService->generate($request->user(), $validated);

        return (new CoverLetterResource($coverLetter))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified cover letter.
     */
    public function show(CoverLetter $coverLetter): CoverLetterResource
    {
        Gate::authorize('view', $coverLetter);

        return new CoverLetterResource($coverLetter);
    }

    /**
     * Update the specified cover letter.
     */
    public function update(Request $request, CoverLetter $coverLetter): CoverLetterResource
    {
        Gate::authorize('update', $coverLetter);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'string'],
        ]);

        $coverLetter->update($validated);

        return new CoverLetterResource($coverLetter->fresh());
    }

    /**
     * Remove the specified cover letter.
     */
    public function destroy(CoverLetter $coverLetter): JsonResponse
    {
        Gate::authorize('delete', $coverLetter);

        $coverLetter->delete();

        return response()->json(['message' => 'Cover letter deleted successfully.']);
    }
}
