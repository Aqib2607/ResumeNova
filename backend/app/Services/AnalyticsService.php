<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AnalyticsDaily;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Record an active user for today (e.g. on login).
     */
    public function recordActiveUser(): void
    {
        $today = now()->toDateString();
        
        $analytics = AnalyticsDaily::firstOrCreate(
            ['date' => $today],
            ['active_users' => 0, 'new_users' => 0, 'page_views' => 0]
        );

        // Simple increment for this demo.
        // In a real production app, we would want to ensure uniqueness (e.g. redis set)
        // rather than blindly incrementing on every login if they login multiple times.
        $analytics->increment('active_users');
    }

    /**
     * Record a new user registration.
     */
    public function recordNewUser(): void
    {
        $today = now()->toDateString();
        
        AnalyticsDaily::firstOrCreate(
            ['date' => $today],
            ['active_users' => 0, 'new_users' => 0, 'page_views' => 0]
        )->increment('new_users');
    }

    /**
     * Get basic dashboard metrics for the user.
     */
    public function getUserMetrics(int $userId): array
    {
        // For now, this is a placeholder for future feature usage.
        return [
            'resumes_created' => 0, // Placeholder
            'profile_views'   => rand(5, 50), // Mock data
        ];
    }
}
