<?php

namespace Database\Factories;

use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'headline' => fake()->jobTitle(),
            'bio' => fake()->paragraph(),
            'website' => fake()->url(),
            'location' => fake()->city() . ', ' . fake()->countryCode(),
            'social_links' => [
                'linkedin' => 'https://linkedin.com/in/' . fake()->userName(),
                'github' => 'https://github.com/' . fake()->userName(),
            ],
        ];
    }
}
