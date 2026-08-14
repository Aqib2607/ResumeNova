<?php

declare(strict_types=1);

namespace App\Http\Requests\ApiKey;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApiKeyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'key' => ['sometimes', 'nullable', 'string', 'min:8', 'max:500'],
            'status' => ['sometimes', 'string', 'in:active,rate_limited,invalid,disabled'],
            'priority' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
