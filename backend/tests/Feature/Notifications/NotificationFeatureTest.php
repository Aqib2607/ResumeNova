<?php

declare(strict_types=1);

namespace Tests\Feature\Notifications;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;
use Tests\TestCase;

class TestNotification extends Notification
{
    public function via($notifiable) { return ['database']; }
    public function toArray($notifiable) { return ['title' => 'Test', 'message' => 'Test']; }
}

class NotificationFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_notifications_page_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('notifications.index'));

        $response->assertStatus(200);
        $response->assertSee('No notifications');
    }

    public function test_notification_can_be_marked_as_read(): void
    {
        $user = User::factory()->create();

        $user->notify(new TestNotification());
        
        $notification = $user->notifications()->first();

        $this->assertTrue($notification->unread());

        $response = $this->actingAs($user)->patch(route('notifications.read', $notification->id));
        
        $response->assertRedirect();
        
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

        $response = $this->actingAs($user)->post(route('notifications.read.all'));
        
        $response->assertRedirect();
        
        $this->assertSame(0, $user->unreadNotifications()->count());
    }
}
