<?php

declare(strict_types=1);

namespace App\Services\Admin;

use App\Enums\UserRole;
use App\Models\AuditLog;
use App\Models\RoleAuditLog;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AdminUserService
{
    /**
     * List users with search, role/status filtering, and pagination.
     *
     * @param array<string, mixed> $filters
     */
    public function listUsers(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = User::query()->with('profile');

        if (!empty($filters['q'])) {
            $term = '%' . trim((string) $filters['q']) . '%';
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        if (!empty($filters['role']) && $filters['role'] !== 'all') {
            $query->where('role', $filters['role']);
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            if ($filters['status'] === 'suspended') {
                $query->whereNotNull('suspended_at');
            } elseif ($filters['status'] === 'active') {
                $query->whereNull('suspended_at');
            }
        }

        $sortField = $filters['sort_by'] ?? 'created_at';
        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['id', 'name', 'email', 'role', 'created_at', 'last_login_at'];
        if (in_array($sortField, $allowedSorts, true)) {
            $query->orderBy($sortField, $sortDir);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }

    /**
     * Update user details.
     *
     * @param array<string, mixed> $data
     */
    public function updateUser(User $actor, User $target, array $data): User
    {
        if (!$actor->canManageUser($target)) {
            throw new AccessDeniedHttpException('You do not have permission to modify this user.');
        }

        $oldValues = $target->only(['name', 'email']);

        $target->update(array_filter([
            'name' => $data['name'] ?? null,
            'email' => $data['email'] ?? null,
        ]));

        AuditLog::create([
            'user_id' => $actor->id,
            'action' => 'user_updated',
            'entity_type' => User::class,
            'entity_id' => (string) $target->id,
            'old_values' => $oldValues,
            'new_values' => $target->only(['name', 'email']),
            'ip_address' => request()->ip(),
        ]);

        return $target->fresh('profile');
    }

    /**
     * Assign role with strict hierarchy rules.
     */
    public function assignRole(User $actor, User $target, UserRole $newRole): User
    {
        // 1. Cannot modify users of equal or higher authority
        if (!$actor->canManageUser($target)) {
            throw new AccessDeniedHttpException('You cannot change the role of a user with equal or higher privileges.');
        }

        // 2. Cannot grant a role higher than actor's own role unless SuperAdmin
        if ($newRole->weight() > $actor->role->weight() && !$actor->isSuperAdmin()) {
            throw new AccessDeniedHttpException('You cannot assign a role higher than your own.');
        }

        $oldRole = $target->role;

        DB::transaction(function () use ($actor, $target, $newRole, $oldRole) {
            $target->update(['role' => $newRole]);

            AuditLog::create([
                'user_id' => $actor->id,
                'action' => 'role_changed',
                'entity_type' => User::class,
                'entity_id' => (string) $target->id,
                'old_values' => ['role' => $oldRole->value],
                'new_values' => ['role' => $newRole->value],
                'ip_address' => request()->ip(),
            ]);
        });

        return $target->fresh();
    }

    /**
     * Suspend user.
     */
    public function suspendUser(User $actor, User $target, ?string $reason = null): User
    {
        if (!$actor->canManageUser($target)) {
            throw new AccessDeniedHttpException('You do not have permission to suspend this user.');
        }

        $target->update([
            'suspended_at' => now(),
        ]);

        AuditLog::create([
            'user_id' => $actor->id,
            'action' => 'user_suspended',
            'entity_type' => User::class,
            'entity_id' => (string) $target->id,
            'old_values' => ['suspended_at' => null],
            'new_values' => ['suspended_at' => $target->suspended_at, 'reason' => $reason],
            'ip_address' => request()->ip(),
        ]);

        return $target->fresh();
    }

    /**
     * Reactivate suspended user.
     */
    public function reactivateUser(User $actor, User $target): User
    {
        if (!$actor->canManageUser($target)) {
            throw new AccessDeniedHttpException('You do not have permission to reactivate this user.');
        }

        $oldSuspendedAt = $target->suspended_at;

        $target->update([
            'suspended_at' => null,
        ]);

        AuditLog::create([
            'user_id' => $actor->id,
            'action' => 'user_reactivated',
            'entity_type' => User::class,
            'entity_id' => (string) $target->id,
            'old_values' => ['suspended_at' => $oldSuspendedAt],
            'new_values' => ['suspended_at' => null],
            'ip_address' => request()->ip(),
        ]);

        return $target->fresh();
    }
}
