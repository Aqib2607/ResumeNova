<?php

namespace App\Http\Controllers;

use App\Models\JobSource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobSourceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sources = JobSource::all();
        return response()->json($sources);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|in:platform,company,agency,referral,other',
            'website_url' => 'nullable|string|url',
            'api_integration_status' => 'nullable|string|in:active,inactive,failed',
            'api_credentials' => 'nullable|array',
            'description' => 'nullable|string',
        ]);

        $source = JobSource::create($validated);
        return response()->json($source, 201);
    }

    public function show(string $id): JsonResponse
    {
        $source = JobSource::findOrFail($id);
        return response()->json($source);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $source = JobSource::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'type' => 'nullable|string|in:platform,company,agency,referral,other',
            'website_url' => 'nullable|string|url',
            'api_integration_status' => 'nullable|string|in:active,inactive,failed',
            'api_credentials' => 'nullable|array',
            'description' => 'nullable|string',
        ]);

        $source->update($validated);
        return response()->json($source);
    }

    public function destroy(string $id): JsonResponse
    {
        $source = JobSource::findOrFail($id);
        $source->delete();

        return response()->json(null, 204);
    }
}
