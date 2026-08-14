<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Resume;
use App\Models\User;

class ResumePolicy
{
    /**
     * Determine whether the user can view any resumes.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the resume.
     */
    public function view(User $user, Resume $resume): bool
    {
        return $user->id === $resume->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can create resumes.
     */
    public function create(User $user): bool
    {
        return ! $user->isSuspended();
    }

    /**
     * Determine whether the user can update the resume.
     */
    public function update(User $user, Resume $resume): bool
    {
        return $user->id === $resume->user_id;
    }

    /**
     * Determine whether the user can delete the resume.
     */
    public function delete(User $user, Resume $resume): bool
    {
        return $user->id === $resume->user_id || $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can duplicate the resume.
     */
    public function duplicate(User $user, Resume $resume): bool
    {
        return $user->id === $resume->user_id || $user->isAdmin();
    }

    /**
     * Determine whether the user can restore a version of the resume.
     */
    public function restoreVersion(User $user, Resume $resume): bool
    {
        return $user->id === $resume->user_id;
    }
}
