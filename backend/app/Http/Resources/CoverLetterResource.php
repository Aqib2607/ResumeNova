<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property \App\Models\CoverLetter $resource
 */
class CoverLetterResource extends JsonResource
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
            'resume_id' => $this->resource->resume_id,
            'title' => $this->resource->title,
            'language' => $this->resource->language,
            'tone' => $this->resource->tone,
            'job_description' => $this->resource->job_description,
            'content' => $this->resource->content,
            'created_at' => $this->resource->created_at->toIso8601String(),
            'updated_at' => $this->resource->updated_at->toIso8601String(),
        ];
    }
}
