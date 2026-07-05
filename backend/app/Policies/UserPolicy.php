<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->isAdmin();
    }

    /**
     * Determine whether the user can assign a role to the model.
     */
    public function assignRole(User $user, User $model): Response
    {
        if (! $user->isAdmin()) {
            return Response::deny('Only administrators can assign roles.');
        }

        if ($user->id === $model->id) {
            return Response::deny('You cannot change your own role.');
        }

        // An admin cannot modify a super_admin's role
        if ($model->isSuperAdmin() && ! $user->isSuperAdmin()) {
            return Response::deny('Only a Super Administrator can manage a Super Administrator.');
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can suspend the model.
     */
    public function suspend(User $user, User $model): Response
    {
        if (! $user->isAdmin()) {
            return Response::deny('Only administrators can suspend users.');
        }

        if ($user->id === $model->id) {
            return Response::deny('You cannot suspend yourself.');
        }

        // No one can suspend a super_admin
        if ($model->isSuperAdmin()) {
            return Response::deny('Super Administrators cannot be suspended.');
        }

        // An admin cannot suspend another admin
        if ($model->isAdmin() && ! $user->isSuperAdmin()) {
            return Response::deny('Only a Super Administrator can suspend an Administrator.');
        }

        return Response::allow();
    }

    /**
     * Determine whether the user can reactivate the model.
     */
    public function reactivate(User $user, User $model): Response
    {
        // Same logic as suspend
        return $this->suspend($user, $model);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): Response
    {
        if (! $user->isSuperAdmin()) {
            return Response::deny('Only Super Administrators can delete users.');
        }

        if ($user->id === $model->id) {
            return Response::deny('You cannot delete yourself.');
        }

        return Response::allow();
    }
}
