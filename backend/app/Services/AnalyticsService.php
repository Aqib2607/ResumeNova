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
     * Get the weekly AI usage for the dashboard chart.
     */
    public function getWeeklyAiUsage(\App\Models\User $user): array
    {
        // Get the last 7 days of AI requests
        $startDate = now()->subDays(6)->startOfDay();
        
        $requests = $user->aiRequests()
            ->where('date', '>=', $startDate)
            ->get()
            ->groupBy(function($item) {
                return $item->date->format('D'); // Mon, Tue, etc.
            });
            
        // Map to chart format, ensuring all 7 days are present
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = now()->subDays($i)->format('D');
            $calls = $requests->has($day) ? $requests->get($day)->sum('calls') : 0;
            $chartData[] = [
                'd' => $day,
                'v' => $calls,
            ];
        }
        
        return $chartData;
    }
}
