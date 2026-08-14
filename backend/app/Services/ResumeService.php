<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Resume;
use App\Models\ResumeVersion;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ResumeService
{
    /**
     * Get paginated resumes for a user.
     */
    public function listForUser(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return $user->resumes()
            ->latest('updated_at')
            ->paginate($perPage);
    }

    /**
     * Create a new resume for a user.
     */
    public function createForUser(User $user, array $data): Resume
    {
        return DB::transaction(function () use ($user, $data) {
            $content = $this->extractContent($data);

            $resume = $user->resumes()->create([
                'title' => $data['title'] ?? 'Untitled Resume',
                'template' => $data['template'] ?? 'modern-professional',
                'version' => $data['version'] ?? '1.0',
                'status' => $data['status'] ?? 'draft',
                'language' => $data['language'] ?? 'en',
                'content' => $content,
            ]);

            // Create initial version snapshot
            $resume->createVersionSnapshot();

            return $resume;
        });
    }

    /**
     * Update an existing resume and optionally create a version snapshot.
     */
    public function update(Resume $resume, array $data, bool $createSnapshot = false): Resume
    {
        return DB::transaction(function () use ($resume, $data, $createSnapshot) {
            if ($createSnapshot && ! empty($resume->content)) {
                $resume->createVersionSnapshot();
            }

            $content = $this->extractContent($data, $resume->content);

            $resume->update(array_filter([
                'title' => $data['title'] ?? null,
                'template' => $data['template'] ?? null,
                'version' => $data['version'] ?? null,
                'status' => $data['status'] ?? null,
                'language' => $data['language'] ?? null,
                'content' => $content,
            ], fn ($v) => $v !== null));

            return $resume->fresh();
        });
    }

    /**
     * Helper to extract content structure from request data.
     */
    private function extractContent(array $data, ?array $existing = []): array
    {
        if (array_key_exists('content', $data) && is_array($data['content'])) {
            return $data['content'];
        }

        $content = $existing ?? [];
        foreach (['basics', 'experiences', 'education', 'projects', 'skill_groups'] as $section) {
            if (array_key_exists($section, $data)) {
                $content[$section] = $data[$section];
            }
        }

        return $content;
    }

    /**
     * Soft-delete a resume.
     */
    public function delete(Resume $resume): bool
    {
        return (bool) $resume->delete();
    }

    /**
     * Duplicate a resume.
     */
    public function duplicate(Resume $resume, User $user): Resume
    {
        return DB::transaction(function () use ($resume, $user) {
            $duplicate = $user->resumes()->create([
                'title' => $resume->title . ' (Copy)',
                'template' => $resume->template,
                'version' => '1.0',
                'status' => 'draft',
                'language' => $resume->language,
                'content' => $resume->content,
            ]);

            $duplicate->createVersionSnapshot();

            return $duplicate;
        });
    }

    /**
     * Get version history for a resume.
     */
    public function getVersions(Resume $resume)
    {
        return $resume->versions;
    }

    /**
     * Restore a historical version to the active resume.
     */
    public function restoreVersion(Resume $resume, int|string $versionId): Resume
    {
        return DB::transaction(function () use ($resume, $versionId) {
            /** @var ResumeVersion $version */
            $version = $resume->versions()->findOrFail($versionId);

            // Snapshot current state before restoring
            $resume->createVersionSnapshot();

            $resume->update([
                'title' => $version->title,
                'template' => $version->template,
                'content' => $version->content,
            ]);

            return $resume->fresh();
        });
    }
}
