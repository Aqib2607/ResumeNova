<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $applications = $request->user()->jobApplications()->with('posting', 'resume')->get();
        return response()->json($applications);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'job_posting_id' => 'required|exists:job_postings,id',
            'resume_id' => 'nullable|exists:resumes,id',
            'status' => 'nullable|string|in:draft,submitted,applied,screening,reviewing,interviewing,offered,rejected,withdrawn',
            'applied_at' => 'nullable|date',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $application = $request->user()->jobApplications()->create($validated);
        $application->load('posting', 'resume');

        return response()->json($application, 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $application = $request->user()->jobApplications()->with('posting', 'resume')->findOrFail($id);
        return response()->json($application);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $application = $request->user()->jobApplications()->findOrFail($id);

        $validated = $request->validate([
            'resume_id' => 'nullable|exists:resumes,id',
            'status' => 'nullable|string|in:draft,submitted,applied,screening,reviewing,interviewing,offered,rejected,withdrawn',
            'applied_at' => 'nullable|date',
            'notes' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $application->update($validated);
        $application->load('posting', 'resume');

        return response()->json($application);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $application = $request->user()->jobApplications()->findOrFail($id);
        $application->delete();

        return response()->json(null, 204);
    }
}
