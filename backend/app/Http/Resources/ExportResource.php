<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property \App\Models\Export $resource
 */
class ExportResource extends JsonResource
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
            'user_id' => $this->resource->user_id,
            'resume_id' => $this->resource->resume_id,
            'resume_title' => $this->resource->resume?->title,
            'cover_letter_id' => $this->resource->cover_letter_id,
            'cover_letter_title' => $this->resource->coverLetter?->title,
            'format' => $this->resource->format,
            'template' => $this->resource->template,
            'file_name' => $this->resource->file_name,
            'file_size' => $this->resource->file_size,
            'file_size_human' => $this->resource->file_size ? round($this->resource->file_size / 1024, 1) . ' KB' : null,
            'status' => $this->resource->status,
            'download_url' => url("/api/exports/{$this->resource->id}/download"),
            'created_at' => $this->resource->created_at->toIso8601String(),
        ];
    }
}
