<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property \App\Models\InterviewQuestion $resource
 */
class InterviewQuestionResource extends JsonResource
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
            'session_id' => $this->resource->session_id,
            'order' => $this->resource->order,
            'category' => $this->resource->category,
            'difficulty' => $this->resource->difficulty,
            'question' => $this->resource->question,
            'hints' => $this->resource->hints ?? [],
            'expected_answer' => $this->resource->expected_answer,
            'user_answer' => $this->resource->user_answer,
            'evaluation' => $this->resource->evaluation,
            'score' => $this->resource->score,
            'completed' => !empty($this->resource->user_answer),
            'created_at' => $this->resource->created_at->toIso8601String(),
        ];
    }
}
