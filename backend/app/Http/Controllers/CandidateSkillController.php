<?php

namespace App\Http\Controllers;

use App\Models\CandidateSkill;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CandidateSkillController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $skills = $request->user()->candidateSkills;
        return response()->json($skills);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'proficiency_level' => 'nullable|string|in:beginner,intermediate,advanced,expert',
            'years_experience' => 'nullable|numeric|min:0',
            'is_verified' => 'boolean',
        ]);

        $skill = $request->user()->candidateSkills()->create($validated);

        return response()->json($skill, 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $skill = $request->user()->candidateSkills()->findOrFail($id);
        return response()->json($skill);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $skill = $request->user()->candidateSkills()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'proficiency_level' => 'nullable|string|in:beginner,intermediate,advanced,expert',
            'years_experience' => 'nullable|numeric|min:0',
            'is_verified' => 'boolean',
        ]);

        $skill->update($validated);

        return response()->json($skill);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $skill = $request->user()->candidateSkills()->findOrFail($id);
        $skill->delete();

        return response()->json(null, 204);
    }
}
