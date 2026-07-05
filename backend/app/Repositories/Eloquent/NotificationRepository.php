<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationRepository implements NotificationRepositoryInterface
{
    public function getPaginatedForUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return User::findOrFail($userId)
            ->notifications()
            ->latest()
            ->paginate($perPage);
    }

    public function getRecentUnreadForUser(int $userId, int $limit = 5)
    {
        return User::findOrFail($userId)
            ->unreadNotifications()
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function markAsRead(int $userId, string $notificationId): bool
    {
        $notification = User::findOrFail($userId)
            ->notifications()
            ->where('id', $notificationId)
            ->first();

        if ($notification && $notification->unread()) {
            $notification->markAsRead();
            return true;
        }

        return false;
    }

    public function markAllAsRead(int $userId): int
    {
        $user = User::findOrFail($userId);
        $count = $user->unreadNotifications()->count();
        
        $user->unreadNotifications->markAsRead();
        
        return $count;
    }

    public function countUnreadForUser(int $userId): int
    {
        return User::findOrFail($userId)
            ->unreadNotifications()
            ->count();
    }
}
