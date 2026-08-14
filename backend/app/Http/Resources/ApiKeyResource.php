<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property \App\Models\ApiKey $resource
 */
class ApiKeyResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'provider' => $this->resource->provider,
            'name' => $this->resource->name,
            'masked_key' => $this->resource->masked_key,
            'priority' => $this->resource->priority,
            'status' => $this->resource->status,
            'usage_count' => $this->resource->usage_count,
            'last_used_at' => $this->resource->last_used_at?->toIso8601String(),
            'cooldown_until' => $this->resource->cooldown_until?->toIso8601String(),
            'last_failed_at' => $this->resource->last_failed_at?->toIso8601String(),
            'failure_reason' => $this->resource->failure_reason,
            'created_at' => $this->resource->created_at->toIso8601String(),
            'updated_at' => $this->resource->updated_at->toIso8601String(),
        ];
    }
}
