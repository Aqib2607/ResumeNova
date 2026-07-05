<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\AuditLog;
use Illuminate\Auth\Events\Logout;
use Illuminate\Support\Facades\Request;

class LogoutListener
{
    /**
     * Handle the event.
     */
    public function handle(Logout $event): void
    {
        if ($event->user) {
            AuditLog::create([
                'user_id'     => $event->user->id,
                'action'      => 'logout',
                'entity_type' => 'session',
                'ip_address'  => Request::ip(),
            ]);
        }
    }
}
