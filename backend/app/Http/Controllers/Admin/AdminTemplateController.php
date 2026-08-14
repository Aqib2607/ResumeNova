<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ResumeTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminTemplateController extends Controller
{
    /**
     * List all resume templates.
     */
    public function index(Request $request): JsonResponse
    {
        $templates = ResumeTemplate::orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json($templates);
    }

    /**
     * Create a new resume template.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slug' => ['required', 'string', 'max:100', 'unique:resume_templates,slug'],
            'name' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', 'max:50'],
            'thumbnail' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
            'is_premium' => ['nullable', 'boolean'],
        ]);

        $template = ResumeTemplate::create($validated);

        return response()->json([
            'message' => 'Template created successfully.',
            'template' => $template,
        ], 201);
    }

    /**
     * Show single template.
     */
    public function show(ResumeTemplate $template): JsonResponse
    {
        return response()->json($template);
    }

    /**
     * Update template details.
     */
    public function update(Request $request, ResumeTemplate $template): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'category' => ['sometimes', 'string', 'max:50'],
            'thumbnail' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
            'is_premium' => ['sometimes', 'boolean'],
        ]);

        $template->update($validated);

        return response()->json([
            'message' => 'Template updated successfully.',
            'template' => $template->fresh(),
        ]);
    }

    /**
     * Delete template.
     */
    public function destroy(ResumeTemplate $template): JsonResponse
    {
        $template->delete();

        return response()->json([
            'message' => 'Template deleted successfully.',
        ]);
    }
}
