<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property \App\Models\InterviewSession $resource
 */
class InterviewSessionResource extends JsonResource
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
            'category' => $this->resource->category,
            'difficulty' => $this->resource->difficulty,
            'language' => $this->resource->language,
            'job_description' => $this->resource->job_description,
            'status' => $this->resource->status,
            'total_questions' => $this->resource->total_questions,
            'completed_questions' => $this->resource->completed_questions,
            'questions' => InterviewQuestionResource::collection($this->whenLoaded('questions')),
            'created_at' => $this->resource->created_at->toIso8601String(),
            'updated_at' => $this->resource->updated_at->toIso8601String(),
        ];
    }
}
