<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Illuminate\View\View;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(): View
    {
        Gate::authorize('viewAny', User::class);

        $users = User::query()
            ->latest()
            ->paginate(15);

        return view('admin.users.index', compact('users'));
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): View
    {
        Gate::authorize('view', $user);

        $user->load(['roleAuditLogs.changedBy' => function ($query) {
            $query->select('id', 'name');
        }])->loadCount('roleAuditLogs');
        
        $assignableRoles = UserRole::cases();

        return view('admin.users.show', compact('user', 'assignableRoles'));
    }

    /**
     * Assign a new role to the user.
     */
    public function assignRole(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('assignRole', $user);

        // Determine which roles this admin is allowed to assign.
        // Super admins can assign anything, regular admins can only assign admin/user.
        $allowedRoles = $request->user()->isSuperAdmin()
            ? UserRole::values()
            : UserRole::adminAssignableValues();

        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in($allowedRoles)],
        ]);

        $user->update(['role' => $validated['role']]);

        return back()->with('status', 'Role successfully updated.');
    }

    /**
     * Suspend the user.
     */
    public function suspend(User $user): RedirectResponse
    {
        Gate::authorize('suspend', $user);

        if (! $user->isSuspended()) {
            $user->update(['suspended_at' => now()]);
        }

        return back()->with('status', 'User suspended.');
    }

    /**
     * Reactivate the user.
     */
    public function reactivate(User $user): RedirectResponse
    {
        Gate::authorize('reactivate', $user);

        if ($user->isSuspended()) {
            $user->update(['suspended_at' => null]);
        }

        return back()->with('status', 'User reactivated.');
    }
}
