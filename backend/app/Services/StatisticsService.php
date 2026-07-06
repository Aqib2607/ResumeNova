<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\User;

class StatisticsService
{
    /**
     * Get the dashboard statistics for a user.
     */
    public function getDashboardStatistics(User $user): array
    {
        $resumeCount = $user->resumes()->count();
        $averageAts = (int) $user->atsAnalyses()->avg('score');
        $aiUsage = $user->aiRequests()->sum('calls');
        $exportsCount = $user->exports()->count();

        return [
            'resumes_count' => $resumeCount,
            'average_ats_score' => $averageAts,
            'ai_usage_count' => $aiUsage,
            'exports_count' => $exportsCount,
        ];
    }
}
