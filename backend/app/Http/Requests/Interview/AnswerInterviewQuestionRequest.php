<?php

declare(strict_types=1);

namespace App\Http\Requests\Interview;

use Illuminate\Foundation\Http\FormRequest;

class AnswerInterviewQuestionRequest extends FormRequest
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
            'answer' => ['required', 'string', 'min:3', 'max:10000'],
        ];
    }
}
