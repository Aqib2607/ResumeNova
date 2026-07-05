<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Contracts\Repository\RepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Abstract base repository.
 * Extend this class in feature repositories and inject the bound model.
 *
 * Usage:
 *   class UserRepository extends BaseRepository
 *   {
 *       protected function model(): string
 *       {
 *           return User::class;
 *       }
 *   }
 */
abstract class BaseRepository implements RepositoryInterface
{
    protected Model $modelInstance;

    public function __construct()
    {
        $this->modelInstance = app($this->model());
    }

    /**
     * Return the fully-qualified model class name.
     */
    abstract protected function model(): string;

    /** @inheritDoc */
    public function all(array $columns = ['*']): Collection
    {
        return $this->modelInstance->newQuery()->get($columns);
    }

    /** @inheritDoc */
    public function find(int|string $id, array $columns = ['*']): ?Model
    {
        return $this->modelInstance->newQuery()->find($id, $columns);
    }

    /** @inheritDoc */
    public function findOrFail(int|string $id, array $columns = ['*']): Model
    {
        $model = $this->find($id, $columns);

        if (! $model) {
            throw (new ModelNotFoundException())->setModel($this->model(), $id);
        }

        return $model;
    }

    /** @inheritDoc */
    public function findWhere(array $conditions, array $columns = ['*']): Collection
    {
        return $this->modelInstance->newQuery()->where($conditions)->get($columns);
    }

    /** @inheritDoc */
    public function findOneWhere(array $conditions, array $columns = ['*']): ?Model
    {
        return $this->modelInstance->newQuery()->where($conditions)->first($columns);
    }

    /** @inheritDoc */
    public function create(array $data): Model
    {
        return $this->modelInstance->newQuery()->create($data);
    }

    /** @inheritDoc */
    public function update(int|string $id, array $data): Model
    {
        $model = $this->findOrFail($id);
        $model->update($data);

        return $model->fresh();
    }

    /** @inheritDoc */
    public function delete(int|string $id): bool
    {
        return (bool) $this->findOrFail($id)->delete();
    }

    /** @inheritDoc */
    public function paginate(int $perPage = 15, array $columns = ['*']): mixed
    {
        return $this->modelInstance->newQuery()->paginate($perPage, $columns);
    }
}
