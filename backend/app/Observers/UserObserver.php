<?php

declare(strict_types=1);

namespace App\Observers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserObserver
{
    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Check if role was changed
        if ($user->wasChanged('role')) {
            $user->roleAuditLogs()->create([
                'changed_by' => Auth::id(),
                'old_role'   => $user->getOriginal('role')?->value,
                'new_role'   => $user->role->value,
                'reason'     => 'Role updated',
                'ip_address' => request()->ip(),
            ]);
        }

        // Check if suspension status changed
        if ($user->wasChanged('suspended_at')) {
            $isSuspended = ! is_null($user->suspended_at);
            
            $user->roleAuditLogs()->create([
                'changed_by' => Auth::id(),
                'old_role'   => $user->role->value, // Role itself didn't change
                'new_role'   => $user->role->value,
                'reason'     => $isSuspended ? 'Account suspended' : 'Account reactivated',
                'ip_address' => request()->ip(),
            ]);
        }
    }
}
