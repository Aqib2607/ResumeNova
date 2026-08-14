<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Admin\AdminUserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function __construct(
        protected AdminUserService $userService,
    ) {}

    /**
     * Display a listing of the users with search and filter.
     */
    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', User::class);

        $filters = $request->only(['q', 'role', 'status', 'sort_by', 'sort_dir']);
        $perPage = (int) $request->query('per_page', 15);

        $users = $this->userService->listUsers($filters, $perPage);

        return response()->json($users);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user): JsonResponse
    {
        Gate::authorize('view', $user);

        $user->load([
            'profile',
            'roleAuditLogs.changedBy' => function ($query) {
                $query->select('id', 'name');
            },
        ])->loadCount(['roleAuditLogs', 'resumes', 'coverLetters']);

        return response()->json([
            'user' => $user,
            'assignableRoles' => UserRole::cases(),
        ]);
    }

    /**
     * Update user details.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        Gate::authorize('update', $user);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'min:2', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        $updated = $this->userService->updateUser($request->user(), $user, $validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $updated,
        ]);
    }

    /**
     * Assign a new role to the user.
     */
    public function assignRole(Request $request, User $user): JsonResponse
    {
        Gate::authorize('assignRole', $user);

        $allowedRoles = $request->user()->isSuperAdmin()
            ? UserRole::values()
            : UserRole::adminAssignableValues();

        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in($allowedRoles)],
        ]);

        $newRole = UserRole::from($validated['role']);
        $updated = $this->userService->assignRole($request->user(), $user, $newRole);

        return response()->json([
            'message' => 'Role successfully updated.',
            'user' => $updated,
        ]);
    }

    /**
     * Suspend the user.
     */
    public function suspend(Request $request, User $user): JsonResponse
    {
        Gate::authorize('suspend', $user);

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $updated = $this->userService->suspendUser($request->user(), $user, $validated['reason'] ?? null);

        return response()->json([
            'message' => 'User suspended successfully.',
            'user' => $updated,
        ]);
    }

    /**
     * Reactivate the user.
     */
    public function reactivate(Request $request, User $user): JsonResponse
    {
        Gate::authorize('reactivate', $user);

        $updated = $this->userService->reactivateUser($request->user(), $user);

        return response()->json([
            'message' => 'User reactivated successfully.',
            'user' => $updated,
        ]);
    }
}
