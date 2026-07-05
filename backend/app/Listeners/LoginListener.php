<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\AuditLog;
use App\Models\SystemLog;
use App\Services\AnalyticsService;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\Facades\Request;

class LoginListener
{
    /**
     * Create the event listener.
     */
    public function __construct(
        private readonly AnalyticsService $analyticsService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        // Write Audit Log
        AuditLog::create([
            'user_id'     => $user->id,
            'action'      => 'login',
            'entity_type' => 'session',
            'ip_address'  => Request::ip(),
        ]);

        // Write System Log
        SystemLog::create([
            'level'   => 'info',
            'message' => "User {$user->email} logged in.",
            'context' => ['user_id' => $user->id, 'ip' => Request::ip()],
        ]);

        // Record Analytics
        $this->analyticsService->recordActiveUser();
    }
}
