<?php

declare(strict_types=1);

namespace App\Http\Requests\Interview;

use Illuminate\Foundation\Http\FormRequest;

class CreateInterviewSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'resume_id' => ['nullable', 'exists:resumes,id'],
            'category' => ['nullable', 'string', 'in:hr,technical,behavioral,system-design,leadership'],
            'difficulty' => ['nullable', 'string', 'in:easy,medium,hard'],
            'language' => ['nullable', 'string', 'max:10'],
            'job_description' => ['nullable', 'string', 'max:10000'],
            'total_questions' => ['nullable', 'integer', 'min:1', 'max:15'],
        ];
    }
}
