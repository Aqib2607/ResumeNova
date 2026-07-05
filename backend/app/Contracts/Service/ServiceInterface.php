<?php

declare(strict_types=1);

namespace App\Contracts\Service;

/**
 * Optional service contract.
 * Implement this interface on services you wish to bind in the IoC container,
 * enabling constructor injection via interface type-hinting.
 *
 * Usage:
 *   In AppServiceProvider::register():
 *     $this->app->bind(ResumeServiceInterface::class, ResumeService::class);
 *
 *   In controller constructor:
 *     public function __construct(private readonly ResumeServiceInterface $resumeService) {}
 */
interface ServiceInterface
{
    public function all(array $columns = ['*']): mixed;

    public function find(int|string $id): mixed;

    public function findOrFail(int|string $id): mixed;

    public function create(array $data): mixed;

    public function update(int|string $id, array $data): mixed;

    public function delete(int|string $id): bool;
}
