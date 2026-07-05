<?php

declare(strict_types=1);

namespace Tests\Feature\Notifications;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Notification;
use Tests\TestCase;

class TestNotification extends Notification
{
    public function via($notifiable) { return ['database']; }
    public function toArray($notifiable) { return ['title' => 'Test', 'message' => 'Test']; }
}

class NotificationFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_notifications_data_can_be_retrieved(): void
    {
        $user = User::factory()->create();
        $user->notify(new TestNotification());

        $response = $this->actingAs($user)->getJson('/api/notifications');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data', 'links', 'current_page', 'total']);
    }

    public function test_notification_can_be_marked_as_read(): void
    {
        $user = User::factory()->create();

        $user->notify(new TestNotification());
        
        $notification = $user->notifications()->first();

        $this->assertTrue($notification->unread());

        $response = $this->actingAs($user)->patchJson("/api/notifications/{$notification->id}/read");
        
        $response->assertStatus(200);
        
        $notification->refresh();
        $this->assertFalse($notification->unread());
    }

    public function test_all_notifications_can_be_marked_as_read(): void
    {
        $user = User::factory()->create();

        $user->notify(new TestNotification());
        $user->notify(new TestNotification());
        $user->notify(new TestNotification());

        $this->assertSame(3, $user->unreadNotifications()->count());

        $response = $this->actingAs($user)->postJson('/api/notifications/read-all');
        
        $response->assertStatus(200);
        
        $this->assertSame(0, $user->unreadNotifications()->count());
    }
}
