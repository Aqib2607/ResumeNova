<?php

declare(strict_types=1);

namespace Tests\Feature\Dashboard;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_data_can_be_retrieved(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/dashboard');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'profile_completion',
            'recent_activity',
            'notifications',
            'metrics'
        ]);
    }

    public function test_suspended_users_receive_403_for_dashboard(): void
    {
        $user = User::factory()->suspended()->create();

        $response = $this->actingAs($user)->getJson('/api/dashboard');

        $response->assertStatus(403)
                 ->assertJson(['message' => 'Your account is suspended.']);
    }

    public function test_dashboard_displays_correct_completion_percentage(): void
    {
        // A new user has name and email, but profile fields are empty.
        // The service checks: name, avatar, headline, bio, location, social_links (6 fields)
        // new user has name only = 1/6 = ~17%
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/dashboard');
        $response->assertStatus(200);
        $response->assertJsonPath('profile_completion', 17);

        // Let's create a full profile
        $user->profile()->create([
            'headline' => 'Test',
            'bio' => 'Test',
            'location' => 'Test',
            'social_links' => ['github' => 'https://github.com'],
        ]);
        // And an avatar
        $user->update(['avatar' => 'avatars/test.jpg']);

        $response = $this->actingAs($user)->getJson('/api/dashboard');
        $response->assertStatus(200);
        $response->assertJsonPath('profile_completion', 100);
    }
}
