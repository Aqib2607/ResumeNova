<?php

declare(strict_types=1);

namespace App\Services;

use App\Repositories\BaseRepository;

/**
 * Abstract base service.
 * Extend this class in feature services and inject the required repository.
 *
 * Usage:
 *   class UserService extends BaseService
 *   {
 *       public function __construct(UserRepository $repository)
 *       {
 *           parent::__construct($repository);
 *       }
 *   }
 */
abstract class BaseService
{
    public function __construct(protected readonly BaseRepository $repository)
    {
    }

    /**
     * Delegate to repository::all().
     */
    public function all(array $columns = ['*']): mixed
    {
        return $this->repository->all($columns);
    }

    /**
     * Delegate to repository::find().
     */
    public function find(int|string $id): mixed
    {
        return $this->repository->find($id);
    }

    /**
     * Delegate to repository::findOrFail().
     */
    public function findOrFail(int|string $id): mixed
    {
        return $this->repository->findOrFail($id);
    }

    /**
     * Delegate to repository::create().
     */
    public function create(array $data): mixed
    {
        return $this->repository->create($data);
    }

    /**
     * Delegate to repository::update().
     */
    public function update(int|string $id, array $data): mixed
    {
        return $this->repository->update($id, $data);
    }

    /**
     * Delegate to repository::delete().
     */
    public function delete(int|string $id): bool
    {
        return $this->repository->delete($id);
    }

    /**
     * Delegate to repository::paginate().
     */
    public function paginate(int $perPage = 15): mixed
    {
        return $this->repository->paginate($perPage);
    }
}
