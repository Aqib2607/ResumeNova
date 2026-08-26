<?php

declare(strict_types=1);

namespace App\Http\Requests\ResumeImport;

use Illuminate\Foundation\Http\FormRequest;

class UploadResumeImportRequest extends FormRequest
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
            'file' => [
                'required',
                'file',
                'mimes:pdf,docx,doc',
                'max:5120', // 5 MB max in KB
            ],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'Please select a resume file to upload.',
            'file.file' => 'The uploaded item must be a valid file.',
            'file.mimes' => 'Only PDF and DOCX files are supported.',
            'file.max' => 'The resume file cannot exceed 5 MB in size.',
        ];
    }
}
