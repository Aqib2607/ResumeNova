<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Export;
use App\Models\User;

class ExportPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Export $export): bool
    {
        return $export->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function download(User $user, Export $export): bool
    {
        return $export->user_id === $user->id;
    }

    public function delete(User $user, Export $export): bool
    {
        return $export->user_id === $user->id;
    }
}
