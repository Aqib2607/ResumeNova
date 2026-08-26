<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\ResumeImport;
use App\Models\User;

class ResumeImportPolicy
{
    /**
     * Determine whether the user can view the import.
     */
    public function view(User $user, ResumeImport $resumeImport): bool
    {
        return $user->id === $resumeImport->user_id;
    }

    /**
     * Determine whether the user can confirm the import.
     */
    public function confirm(User $user, ResumeImport $resumeImport): bool
    {
        return $user->id === $resumeImport->user_id && in_array($resumeImport->status, [
            ResumeImport::STATUS_READY,
            ResumeImport::STATUS_COMPLETED,
        ], true);
    }

    /**
     * Determine whether the user can delete/cancel the import.
     */
    public function delete(User $user, ResumeImport $resumeImport): bool
    {
        return $user->id === $resumeImport->user_id;
    }
}
