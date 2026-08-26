<?php

namespace App\Http\Controllers;

use App\Models\SavedJob;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SavedJobController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $savedJobs = $request->user()->savedJobs()->with('posting')->get();
        return response()->json($savedJobs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'job_posting_id' => 'required|exists:job_postings,id',
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:saved,applied,interviewing,offered,rejected,archived',
        ]);

        // Prevent duplicates
        $savedJob = $request->user()->savedJobs()->firstOrCreate(
            ['job_posting_id' => $validated['job_posting_id']],
            $validated
        );

        $savedJob->load('posting');
        return response()->json($savedJob, 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $savedJob = $request->user()->savedJobs()->with('posting')->findOrFail($id);
        return response()->json($savedJob);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $savedJob = $request->user()->savedJobs()->findOrFail($id);

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'status' => 'nullable|string|in:saved,applied,interviewing,offered,rejected,archived',
        ]);

        $savedJob->update($validated);

        $savedJob->load('posting');
        return response()->json($savedJob);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $savedJob = $request->user()->savedJobs()->findOrFail($id);
        $savedJob->delete();

        return response()->json(null, 204);
    }
}
