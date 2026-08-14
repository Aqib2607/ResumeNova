<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    /**
     * Get a listing of notifications.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Return a flat list of the latest 20 notifications (most recent first)
        $notifications = $user->notifications()->latest()->limit(20)->get();

        if ($notifications->isEmpty()) {
            $user->notifications()->create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\WelcomeNotification',
                'data' => [
                    'title' => 'Welcome to ResumeNova!',
                    'body' => 'Get started by creating your first AI-optimized resume, scanning with ATS, or generating a cover letter.',
                ],
                'read_at' => null,
            ]);

            $user->notifications()->create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'type' => 'App\Notifications\AiEngineNotification',
                'data' => [
                    'title' => 'AI Engine Ready',
                    'body' => 'Your AI models are ready. Generate summaries, bullet points, skills, and mock interview questions with one click.',
                ],
                'read_at' => null,
            ]);

            $notifications = $user->notifications()->latest()->limit(20)->get();
        }

        return response()->json($notifications);
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $this->notificationService->markAsRead($request->user()->id, $id);

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->notificationService->markAllAsRead($request->user()->id);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
