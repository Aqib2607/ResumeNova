<?php

declare(strict_types=1);

namespace App\Http\Requests\ResumeImport;

use Illuminate\Foundation\Http\FormRequest;

class ConfirmResumeImportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null && !$this->user()->isSuspended();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'template' => ['nullable', 'string', 'in:modern-professional,corporate-executive,ats-professional,creative-professional'],
            'status' => ['nullable', 'string', 'in:draft,published,archived'],
            'language' => ['nullable', 'string', 'max:10'],
            'version' => ['nullable', 'string', 'max:20'],

            // Structured section validations
            'basics' => ['nullable', 'array'],
            'basics.full_name' => ['nullable', 'string', 'max:255'],
            'basics.headline' => ['nullable', 'string', 'max:255'],
            'basics.email' => ['nullable', 'string', 'max:255'],
            'basics.phone' => ['nullable', 'string', 'max:50'],
            'basics.location' => ['nullable', 'string', 'max:255'],
            'basics.website' => ['nullable', 'string', 'max:255'],
            'basics.linkedin' => ['nullable', 'string', 'max:255'],
            'basics.summary' => ['nullable', 'string'],

            'experiences' => ['nullable', 'array'],
            'experiences.*.id' => ['nullable', 'string'],
            'experiences.*.company' => ['nullable', 'string', 'max:255'],
            'experiences.*.role' => ['nullable', 'string', 'max:255'],
            'experiences.*.location' => ['nullable', 'string', 'max:255'],
            'experiences.*.start_date' => ['nullable', 'string', 'max:50'],
            'experiences.*.end_date' => ['nullable', 'string', 'max:50'],
            'experiences.*.current' => ['nullable', 'boolean'],
            'experiences.*.bullets' => ['nullable', 'array'],

            'education' => ['nullable', 'array'],
            'education.*.id' => ['nullable', 'string'],
            'education.*.school' => ['nullable', 'string', 'max:255'],
            'education.*.degree' => ['nullable', 'string', 'max:255'],
            'education.*.field' => ['nullable', 'string', 'max:255'],
            'education.*.start_date' => ['nullable', 'string', 'max:50'],
            'education.*.end_date' => ['nullable', 'string', 'max:50'],
            'education.*.gpa' => ['nullable', 'string', 'max:50'],

            'projects' => ['nullable', 'array'],
            'projects.*.id' => ['nullable', 'string'],
            'projects.*.name' => ['nullable', 'string', 'max:255'],
            'projects.*.description' => ['nullable', 'string'],
            'projects.*.link' => ['nullable', 'string', 'max:255'],
            'projects.*.tech' => ['nullable', 'array'],

            'skill_groups' => ['nullable', 'array'],
            'skill_groups.*.id' => ['nullable', 'string'],
            'skill_groups.*.category' => ['nullable', 'string', 'max:255'],
            'skill_groups.*.skills' => ['nullable', 'array'],

            'content' => ['nullable', 'array'],
        ];
    }

    /**
     * Transform and normalize the validated request payload into the exact structure for ResumeService::createForUser().
     */
    public function toNormalizedResumeData(): array
    {
        $validated = $this->validated();

        $content = [];

        if (isset($validated['content']) && is_array($validated['content'])) {
            $content = $validated['content'];
        }

        foreach (['basics', 'experiences', 'education', 'projects', 'skill_groups'] as $section) {
            if (isset($validated[$section]) && is_array($validated[$section])) {
                $content[$section] = $validated[$section];
            } elseif (!isset($content[$section])) {
                $content[$section] = match ($section) {
                    'basics' => [
                        'full_name' => '',
                        'headline' => '',
                        'email' => '',
                        'phone' => '',
                        'location' => '',
                        'website' => '',
                        'linkedin' => '',
                        'summary' => '',
                    ],
                    'experiences' => [],
                    'education' => [],
                    'projects' => [],
                    'skill_groups' => [],
                };
            }
        }

        return [
            'title' => $validated['title'] ?? 'Imported Resume',
            'template' => $validated['template'] ?? 'modern-professional',
            'status' => $validated['status'] ?? 'draft',
            'language' => $validated['language'] ?? 'en',
            'version' => $validated['version'] ?? '1.0',
            'content' => $content,
        ];
    }
}
