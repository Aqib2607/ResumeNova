<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;
use App\Services\StatisticsService;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService,
        private readonly StatisticsService $statisticsService,
        private readonly AnalyticsService $analyticsService
    ) {}

    /**
     * Get the user dashboard data.
     */
    public function index(Request $request): JsonResponse
    {
        $dashboardData = $this->dashboardService->getDashboardData($request->user());

        return response()->json($dashboardData);
    }

    /**
     * Get the statistics for the dashboard cards.
     */
    public function statistics(Request $request): JsonResponse
    {
        return response()->json($this->statisticsService->getDashboardStatistics($request->user()));
    }

    /**
     * Get the AI usage chart data for the dashboard.
     */
    public function chart(Request $request): JsonResponse
    {
        return response()->json($this->analyticsService->getWeeklyAiUsage($request->user()));
    }

    /**
     * Get the recent resumes for the dashboard.
     */
    public function recentResumes(Request $request): JsonResponse
    {
        $resumes = $request->user()->resumes()->latest('updated_at')->take(5)->get();
        return response()->json($resumes);
    }

    /**
     * Get the recent exports for the dashboard.
     */
    public function recentExports(Request $request): JsonResponse
    {
        $exports = $request->user()->exports()->latest()->take(3)->get();
        return response()->json($exports);
    }

    /**
     * Get the API keys for the dashboard.
     */
    public function apiKeys(Request $request): JsonResponse
    {
        $keys = $request->user()->apiKeys()->latest()->get();
        return response()->json($keys);
    }
}
