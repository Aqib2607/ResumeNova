<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\Contracts\NotificationRepositoryInterface;

class NotificationService
{
    public function __construct(
        private readonly NotificationRepositoryInterface $notificationRepository
    ) {}

    public function getPaginatedForUser(int $userId, int $perPage = 15)
    {
        return $this->notificationRepository->getPaginatedForUser($userId, $perPage);
    }

    public function getSummaryForDashboard(int $userId, int $limit = 5)
    {
        return [
            'recent' => $this->notificationRepository->getRecentUnreadForUser($userId, $limit),
            'unread_count' => $this->notificationRepository->countUnreadForUser($userId),
        ];
    }

    public function markAsRead(int $userId, string $notificationId): bool
    {
        return $this->notificationRepository->markAsRead($userId, $notificationId);
    }

    public function markAllAsRead(int $userId): int
    {
        return $this->notificationRepository->markAllAsRead($userId);
    }
}
