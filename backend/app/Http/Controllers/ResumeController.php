<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Resume\StoreResumeRequest;
use App\Http\Requests\Resume\UpdateResumeRequest;
use App\Http\Resources\ResumeResource;
use App\Http\Resources\ResumeVersionResource;
use App\Models\Resume;
use App\Services\ResumeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class ResumeController extends Controller
{
    public function __construct(
        private readonly ResumeService $resumeService
    ) {}

    /**
     * Display a listing of the user's resumes.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        Gate::authorize('viewAny', Resume::class);

        $perPage = (int) $request->query('per_page', 15);
        $resumes = $this->resumeService->listForUser($request->user(), $perPage);

        return ResumeResource::collection($resumes);
    }

    /**
     * Store a newly created resume in storage.
     */
    public function store(StoreResumeRequest $request): JsonResponse
    {
        Gate::authorize('create', Resume::class);

        $resume = $this->resumeService->createForUser($request->user(), $request->validated());

        return (new ResumeResource($resume))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resume.
     */
    public function show(Resume $resume): ResumeResource
    {
        Gate::authorize('view', $resume);

        return new ResumeResource($resume);
    }

    /**
     * Update the specified resume in storage.
     */
    public function update(UpdateResumeRequest $request, Resume $resume): ResumeResource
    {
        Gate::authorize('update', $resume);

        $createSnapshot = $request->boolean('create_snapshot', false);
        $updated = $this->resumeService->update($resume, $request->validated(), $createSnapshot);

        return new ResumeResource($updated);
    }

    /**
     * Remove the specified resume from storage.
     */
    public function destroy(Resume $resume): JsonResponse
    {
        Gate::authorize('delete', $resume);

        $this->resumeService->delete($resume);

        return response()->json(['message' => 'Resume deleted successfully'], 200);
    }

    /**
     * Duplicate the specified resume.
     */
    public function duplicate(Resume $resume, Request $request): JsonResponse
    {
        Gate::authorize('duplicate', $resume);

        $duplicate = $this->resumeService->duplicate($resume, $request->user());

        return (new ResumeResource($duplicate))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the historical versions for the specified resume.
     */
    public function versions(Resume $resume): AnonymousResourceCollection
    {
        Gate::authorize('view', $resume);

        $versions = $this->resumeService->getVersions($resume);

        return ResumeVersionResource::collection($versions);
    }

    /**
     * Restore a historical version of the resume.
     */
    public function restoreVersion(Resume $resume, string $versionId): ResumeResource
    {
        Gate::authorize('restoreVersion', $resume);

        $restored = $this->resumeService->restoreVersion($resume, $versionId);

        return new ResumeResource($restored);
    }
}
