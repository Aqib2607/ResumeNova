<?php

declare(strict_types=1);

namespace App\Contracts\Repository;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Generic repository contract.
 * All concrete repositories MUST implement this interface.
 */
interface RepositoryInterface
{
    /**
     * Return all records.
     */
    public function all(array $columns = ['*']): Collection;

    /**
     * Find a record by primary key.
     */
    public function find(int|string $id, array $columns = ['*']): ?Model;

    /**
     * Find a record by primary key or throw ModelNotFoundException.
     */
    public function findOrFail(int|string $id, array $columns = ['*']): Model;

    /**
     * Find records matching a where clause.
     */
    public function findWhere(array $conditions, array $columns = ['*']): Collection;

    /**
     * Find a single record matching conditions.
     */
    public function findOneWhere(array $conditions, array $columns = ['*']): ?Model;

    /**
     * Create a new record.
     */
    public function create(array $data): Model;

    /**
     * Update a record by primary key.
     */
    public function update(int|string $id, array $data): Model;

    /**
     * Delete a record by primary key.
     */
    public function delete(int|string $id): bool;

    /**
     * Paginate results.
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): mixed;
}
