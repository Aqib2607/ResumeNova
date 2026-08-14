<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\CoverLetter;
use App\Models\User;

class CoverLetterPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CoverLetter $coverLetter): bool
    {
        return $coverLetter->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CoverLetter $coverLetter): bool
    {
        return $coverLetter->user_id === $user->id;
    }

    public function delete(User $user, CoverLetter $coverLetter): bool
    {
        return $coverLetter->user_id === $user->id;
    }
}
