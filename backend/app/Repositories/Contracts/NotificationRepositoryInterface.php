<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Notifications\DatabaseNotification;

interface NotificationRepositoryInterface
{
    /**
     * Get paginated notifications for a user.
     */
    public function getPaginatedForUser(int $userId, int $perPage = 15): LengthAwarePaginator;

    /**
     * Get recent unread notifications for a user.
     * 
     * @return \Illuminate\Database\Eloquent\Collection<int, DatabaseNotification>
     */
    public function getRecentUnreadForUser(int $userId, int $limit = 5);

    /**
     * Mark a specific notification as read for a user.
     */
    public function markAsRead(int $userId, string $notificationId): bool;

    /**
     * Mark all unread notifications as read for a user.
     */
    public function markAllAsRead(int $userId): int;

    /**
     * Count unread notifications for a user.
     */
    public function countUnreadForUser(int $userId): int;
}
