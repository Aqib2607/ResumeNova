<?php

namespace App\Http\Controllers;

use App\Models\JobPreference;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class JobPreferenceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $preferences = $request->user()->jobPreferences;
        return response()->json($preferences);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'titles' => 'nullable|array',
            'locations' => 'nullable|array',
            'location_types' => 'nullable|array',
            'employment_types' => 'nullable|array',
            'min_salary' => 'nullable|numeric|min:0',
            'salary_currency' => 'nullable|string|max:10',
            'industries' => 'nullable|array',
            'skills' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $preference = $request->user()->jobPreferences()->create($validated);

        return response()->json($preference, 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $preference = $request->user()->jobPreferences()->findOrFail($id);
        return response()->json($preference);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $preference = $request->user()->jobPreferences()->findOrFail($id);

        $validated = $request->validate([
            'titles' => 'nullable|array',
            'locations' => 'nullable|array',
            'location_types' => 'nullable|array',
            'employment_types' => 'nullable|array',
            'min_salary' => 'nullable|numeric|min:0',
            'salary_currency' => 'nullable|string|max:10',
            'industries' => 'nullable|array',
            'skills' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $preference->update($validated);

        return response()->json($preference);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $preference = $request->user()->jobPreferences()->findOrFail($id);
        $preference->delete();

        return response()->json(null, 204);
    }
}
