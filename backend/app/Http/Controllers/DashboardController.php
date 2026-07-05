<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Illuminate\Http\Request;
use Illuminate\View\View;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    /**
     * Display the user dashboard.
     */
    public function index(Request $request): View
    {
        $dashboardData = $this->dashboardService->getDashboardData($request->user());

        return view('dashboard.index', compact('dashboardData'));
    }
}
