<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\AdminAnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAnalyticsController extends Controller
{
    public function __construct(
        protected AdminAnalyticsService $analyticsService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $detailed = $this->analyticsService->getDetailedAnalytics();

        return response()->json($detailed);
    }
}
