<?php

declare(strict_types=1);

namespace Tests\Feature\Profile;

use App\Models\AuditLog;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_information_can_be_retrieved(): void
    {
        $user = User::factory()->create();
        $user->profile()->create([
            'headline' => 'Software Engineer',
            'bio' => 'Building cool things',
        ]);

        $response = $this->actingAs($user)->getJson('/api/profile');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'user' => [
                'id', 'name', 'email', 'avatar',
                'profile' => ['headline', 'bio', 'location', 'website', 'social_links']
            ]
        ]);
        $response->assertJsonPath('user.profile.headline', 'Software Engineer');
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patchJson('/api/profile', [
            'name' => 'Test User',
            'headline' => 'Test Headline',
            'bio' => 'A nice bio',
            'location' => 'London',
            'website' => 'https://example.com',
            'social_links' => [
                'github' => 'https://github.com/test'
            ]
        ]);

        $response->assertStatus(200)
                 ->assertJson(['message' => 'Profile successfully updated']);

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        
        $profile = $user->profile;
        $this->assertNotNull($profile);
        $this->assertSame('Test Headline', $profile->headline);
        $this->assertSame('A nice bio', $profile->bio);
        $this->assertSame('London', $profile->location);
        $this->assertSame('https://example.com', $profile->website);
        $this->assertSame('https://github.com/test', $profile->social_links['github']);
    }

    public function test_avatar_can_be_uploaded(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        $file = UploadedFile::fake()->create('avatar.jpg', 100, 'image/jpeg');

        $response = $this->actingAs($user)->patchJson('/api/profile', [
            'name' => 'Test User',
            'avatar' => $file,
        ]);

        $response->assertStatus(200);
        
        $user->refresh();
        $this->assertNotNull($user->avatar);
        $this->assertTrue(Storage::disk('public')->exists($user->avatar));
    }

    public function test_audit_log_is_created_on_profile_update(): void
    {
        $user = User::factory()->create();

        $this->assertDatabaseCount('audit_logs', 0);

        $this->actingAs($user)->patchJson('/api/profile', [
            'name' => 'Test User',
            'headline' => 'Audit Test',
        ]);

        $this->assertDatabaseCount('audit_logs', 1);
        $log = AuditLog::first();
        
        $this->assertSame('profile_updated', $log->action);
        $this->assertSame($user->id, $log->user_id);
        $this->assertSame('Audit Test', $log->new_values['headline']);
    }
}
