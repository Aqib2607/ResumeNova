<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Models\Resume;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Resume>
 */
class ResumeFactory extends Factory
{
    protected $model = Resume::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->jobTitle() . ' Resume',
            'template' => 'modern-professional',
            'version' => '1.0',
            'status' => 'draft',
            'language' => 'en',
            'content' => [
                'basics' => [
                    'full_name' => fake()->name(),
                    'headline' => fake()->jobTitle(),
                    'email' => fake()->safeEmail(),
                    'phone' => fake()->phoneNumber(),
                    'location' => fake()->city(),
                    'summary' => fake()->paragraph(),
                ],
                'experiences' => [],
                'education' => [],
                'projects' => [],
                'skill_groups' => [],
            ],
        ];
    }
}
