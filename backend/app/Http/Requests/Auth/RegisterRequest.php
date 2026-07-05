<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
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
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:100',
                'regex:/^[\pL\s\-\']+$/u', // letters, spaces, hyphens, apostrophes only
            ],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email:rfc',
                'max:255',
                'unique:' . User::class,
            ],
            'password' => [
                'required',
                'confirmed',
                Password::defaults(),
            ],
        ];
    }

    /**
     * Custom human-friendly validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required'  => 'Please enter your full name.',
            'name.min'       => 'Your name must be at least 2 characters.',
            'name.max'       => 'Your name may not exceed 100 characters.',
            'name.regex'     => 'Your name may only contain letters, spaces, hyphens and apostrophes.',
            'email.required' => 'Please enter your email address.',
            'email.email'    => 'Please enter a valid email address.',
            'email.unique'   => 'An account with this email already exists. Try logging in instead.',
            'password.required'  => 'Please choose a password.',
            'password.confirmed' => 'The password confirmation does not match.',
        ];
    }

    /**
     * Prepare the data for validation.
     * Trim name and lowercase email before validating.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name'  => trim((string) $this->name),
            'email' => strtolower(trim((string) $this->email)),
        ]);
    }
}
