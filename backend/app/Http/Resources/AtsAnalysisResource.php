<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property \App\Models\AtsAnalysis $resource
 */
class AtsAnalysisResource extends JsonResource
{
    /**
     * Transform the resource into an array matching frontend AtsAnalysis interface.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $feedback = is_array($this->resource->feedback) ? $this->resource->feedback : [];

        return [
            'id' => $this->resource->id,
            'resume_id' => $this->resource->resume_id,
            'score' => $this->resource->score,
            'matched_skills' => $feedback['matched_skills'] ?? [],
            'missing_skills' => $feedback['missing_skills'] ?? [],
            'keywords' => $feedback['keywords'] ?? [],
            'recommendations' => $feedback['recommendations'] ?? [],
            'strengths' => $feedback['strengths'] ?? [],
            'weaknesses' => $feedback['weaknesses'] ?? [],
            'created_at' => $this->resource->created_at->toIso8601String(),
        ];
    }
}
