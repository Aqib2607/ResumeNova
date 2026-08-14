<?php

declare(strict_types=1);

namespace App\Services\Admin;

use App\Models\AiCheckpoint;
use App\Models\AtsAnalysis;
use App\Models\AuditLog;
use App\Models\CoverLetter;
use App\Models\Export;
use App\Models\InterviewSession;
use App\Models\Resume;
use App\Models\ResumeTemplate;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsService
{
    /**
     * Get aggregate overview statistics for the Admin Dashboard.
     */
    public function getDashboardOverview(): array
    {
        $now = now();
        $startOfWeek = $now->copy()->startOfWeek();
        $startOfMonth = $now->copy()->startOfMonth();

        $totalUsers = User::count();
        $activeUsers = User::whereNull('suspended_at')->count();
        $newUsersThisWeek = User::where('created_at', '>=', $startOfWeek)->count();
        $newUsersThisMonth = User::where('created_at', '>=', $startOfMonth)->count();

        $totalResumes = Resume::count();
        $totalCoverLetters = CoverLetter::count();
        $totalAtsAnalyses = AtsAnalysis::count();
        $totalInterviewSessions = InterviewSession::count();
        $totalExports = Export::count();
        $totalAiCheckpoints = AiCheckpoint::count();

        return [
            'users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'new_this_week' => $newUsersThisWeek,
                'new_this_month' => $newUsersThisMonth,
            ],
            'content' => [
                'total_resumes' => $totalResumes,
                'total_cover_letters' => $totalCoverLetters,
                'total_ats_analyses' => $totalAtsAnalyses,
                'total_interview_sessions' => $totalInterviewSessions,
                'total_exports' => $totalExports,
            ],
            'ai' => [
                'total_operations' => $totalAiCheckpoints,
            ],
        ];
    }

    /**
     * Get timeseries analytics for graphs and metric breakdowns.
     */
    public function getDetailedAnalytics(): array
    {
        $days = 14;
        $userGrowth = [];
        $aiActivity = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $start = Carbon::parse($date)->startOfDay();
            $end = Carbon::parse($date)->endOfDay();

            $userCount = User::whereBetween('created_at', [$start, $end])->count();
            $aiCount = AiCheckpoint::whereBetween('created_at', [$start, $end])->count();
            $exportCount = Export::whereBetween('created_at', [$start, $end])->count();

            $userGrowth[] = [
                'date' => $date,
                'registrations' => $userCount,
            ];

            $aiActivity[] = [
                'date' => $date,
                'ai_requests' => $aiCount,
                'exports' => $exportCount,
            ];
        }

        $templatePopularity = ResumeTemplate::orderBy('usage_count', 'desc')
            ->select('id', 'name', 'slug', 'category', 'usage_count')
            ->get();

        return [
            'user_growth' => $userGrowth,
            'ai_activity' => $aiActivity,
            'template_popularity' => $templatePopularity,
        ];
    }
}
