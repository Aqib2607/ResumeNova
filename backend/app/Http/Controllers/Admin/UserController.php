<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $users = User::query()
            ->latest()
            ->paginate(15);

        return response()->json($users);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        Gate::authorize('view', $user);

        $user->load(['roleAuditLogs.changedBy' => function ($query) {
            $query->select('id', 'name');
        }])->loadCount('roleAuditLogs');
        
        $assignableRoles = UserRole::cases();

        return response()->json([
            'user' => $user,
            'assignableRoles' => $assignableRoles,
        ]);
    }

    /**
     * Assign a new role to the user.
     */
    public function assignRole(Request $request, User $user): JsonResponse
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

        return response()->json(['message' => 'Role successfully updated', 'user' => $user->fresh()]);
    }

    /**
     * Suspend the user.
     */
    public function suspend(User $user): JsonResponse
    {
        Gate::authorize('suspend', $user);

        if (! $user->isSuspended()) {
            $user->update(['suspended_at' => now()]);
        }

        return response()->json(['message' => 'User suspended']);
    }

    /**
     * Reactivate the user.
     */
    public function reactivate(User $user): JsonResponse
    {
        Gate::authorize('reactivate', $user);

        if ($user->isSuspended()) {
            $user->update(['suspended_at' => null]);
        }

        return response()->json(['message' => 'User reactivated']);
    }
}
