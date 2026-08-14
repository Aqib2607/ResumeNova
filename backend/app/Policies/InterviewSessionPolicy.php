<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\InterviewSession;
use App\Models\User;

class InterviewSessionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, InterviewSession $session): bool
    {
        return $session->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, InterviewSession $session): bool
    {
        return $session->user_id === $user->id;
    }

    public function delete(User $user, InterviewSession $session): bool
    {
        return $session->user_id === $user->id;
    }
}
