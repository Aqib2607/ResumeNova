<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    /**
     * Get the user dashboard data.
     */
    public function index(Request $request): JsonResponse
    {
        $dashboardData = $this->dashboardService->getDashboardData($request->user());

        return response()->json($dashboardData);
    }
}
