<?php

declare(strict_types=1);

namespace Tests\Feature\Dashboard;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_page_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertStatus(200);
        $response->assertSee('Profile Completion');
        $response->assertSee('Recent Activity');
    }

    public function test_suspended_users_cannot_access_dashboard(): void
    {
        $user = User::factory()->suspended()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));

        $response->assertRedirect(route('suspended'));
    }

    public function test_dashboard_displays_correct_completion_percentage(): void
    {
        // A new user has name and email, but profile fields are empty.
        // The service checks: name, avatar, headline, bio, location, social_links (6 fields)
        // new user has name only = 1/6 = ~17%
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('dashboard'));
        $response->assertStatus(200);
        $response->assertSee('17%');

        // Let's create a full profile
        $user->profile()->create([
            'headline' => 'Test',
            'bio' => 'Test',
            'location' => 'Test',
            'social_links' => ['github' => 'https://github.com'],
        ]);
        // And an avatar
        $user->update(['avatar' => 'avatars/test.jpg']);

        $response = $this->actingAs($user)->get(route('dashboard'));
        $response->assertStatus(200);
        $response->assertSee('100%');
    }
}
