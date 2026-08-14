<?php

declare(strict_types=1);

namespace App\Http\Requests\Resume;

use Illuminate\Foundation\Http\FormRequest;

class StoreResumeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
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
            'template' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:draft,published,archived'],
            'language' => ['nullable', 'string', 'max:10'],
            'version' => ['nullable', 'string', 'max:20'],
            'content' => ['nullable', 'array'],
        ];
    }
}
