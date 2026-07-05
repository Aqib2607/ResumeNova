<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;

class DashboardService
{
    public function __construct(
        private readonly NotificationService $notificationService,
        private readonly AnalyticsService $analyticsService
    ) {}

    /**
     * Get all data required for the user dashboard.
     */
    public function getDashboardData(User $user): array
    {
        $user->load('profile');

        return [
            'profile_completion' => $this->calculateProfileCompletion($user),
            'recent_activity'    => $this->getRecentActivity($user),
            'notifications'      => $this->notificationService->getSummaryForDashboard($user->id),
            'metrics'            => $this->analyticsService->getUserMetrics($user->id),
        ];
    }

    /**
     * Calculate profile completion percentage.
     */
    private function calculateProfileCompletion(User $user): int
    {
        $fields = [
            $user->name,
            $user->avatar,
            $user->profile?->headline,
            $user->profile?->bio,
            $user->profile?->location,
            $user->profile?->social_links,
        ];

        $completed = 0;
        foreach ($fields as $field) {
            if (! empty($field)) {
                $completed++;
            }
        }

        $totalFields = count($fields);
        return (int) round(($completed / $totalFields) * 100);
    }

    /**
     * Get recent activity logs for the user.
     */
    private function getRecentActivity(User $user)
    {
        // Get the latest 5 audit logs
        return $user->auditLogs()
            ->latest()
            ->limit(5)
            ->get();
    }
}
