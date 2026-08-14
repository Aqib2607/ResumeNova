<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function __construct(
        protected AdminAnalyticsService $analyticsService,
    ) {}

    public function overview(Request $request): JsonResponse
    {
        $overview = $this->analyticsService->getDashboardOverview();

        return response()->json($overview);
    }
}
