<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResumeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $content = is_array($this->content) ? $this->content : [];

        return [
            'id' => (string) $this->id,
            'user_id' => (string) $this->user_id,
            'title' => $this->title,
            'template' => $this->template ?? 'modern-professional',
            'version' => $this->version ?? '1.0',
            'status' => $this->status ?? 'draft',
            'language' => $this->language ?? 'en',
            'basics' => $content['basics'] ?? [
                'full_name' => '',
                'headline' => '',
                'email' => '',
                'phone' => '',
                'location' => '',
                'website' => '',
                'linkedin' => '',
                'summary' => '',
            ],
            'experiences' => $content['experiences'] ?? [],
            'education' => $content['education'] ?? [],
            'projects' => $content['projects'] ?? [],
            'skill_groups' => $content['skill_groups'] ?? [],
            'content' => $content,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
