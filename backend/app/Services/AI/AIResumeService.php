<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Models\Resume;
use App\Models\User;
use App\Services\AI\AIEngineService;
use App\Services\AI\ResumePromptService;
use App\Services\ResumeService;
use InvalidArgumentException;

class AIResumeService
{
    public function __construct(
        protected AIEngineService $aiEngine,
        protected ResumePromptService $promptService,
        protected ResumeService $resumeService
    ) {}

    /**
     * Generate or enhance a resume's professional summary.
     */
    public function generateSummary(Resume $resume, User $user, array $options = []): array
    {
        $content = $resume->content ?? [];
        $basics = $content['basics'] ?? [];
        $experiences = $content['experiences'] ?? [];
        $skills = $content['skill_groups'] ?? [];

        $language = $options['language'] ?? ($resume->language ?: 'en');
        $targetRole = $options['target_role'] ?? null;
        $currentSummary = $options['current_summary'] ?? ($basics['summary'] ?? null);

        $aiRequest = $this->promptService->buildSummaryPrompt(
            headline: (string) ($basics['headline'] ?? $resume->title),
            experiences: $experiences,
            skills: $skills,
            language: $language,
            currentSummary: $currentSummary,
            targetRole: $targetRole
        );

        $response = $this->aiEngine->execute(
            user: $user,
            request: $aiRequest,
            operationType: 'resume_summary',
            resumeId: $resume->id
        );

        $json = $response->json();
        $summary = $json['summary'] ?? trim($response->content);

        // Optionally persist directly or return candidate summary for user review
        if (!empty($options['persist']) && $options['persist'] === true) {
            $basics['summary'] = $summary;
            $content['basics'] = $basics;
            $this->resumeService->update($resume, ['content' => $content], true);
        }

        return [
            'summary' => $summary,
            'language' => $language,
            'model' => $response->model,
        ];
    }

    /**
     * Improve experience bullet points for a role.
     */
    public function improveExperience(Resume $resume, User $user, array $data): array
    {
        $role = $data['role'] ?? '';
        $company = $data['company'] ?? '';
        $bullets = is_array($data['bullets'] ?? null) ? $data['bullets'] : explode("\n", (string) ($data['bullets'] ?? ''));
        $bullets = array_filter(array_map('trim', $bullets));

        if (empty($role) && empty($company) && empty($bullets)) {
            throw new InvalidArgumentException('Please provide a role, company, or existing bullet points to improve.');
        }

        $language = $data['language'] ?? ($resume->language ?: 'en');
        $jobDescription = $data['job_description'] ?? null;

        $aiRequest = $this->promptService->buildExperiencePrompt(
            role: (string) $role,
            company: (string) $company,
            currentBullets: array_values($bullets),
            language: $language,
            jobDescription: $jobDescription
        );

        $response = $this->aiEngine->execute(
            user: $user,
            request: $aiRequest,
            operationType: 'resume_experience',
            resumeId: $resume->id
        );

        $json = $response->json();
        $improvedBullets = $json['bullets'] ?? array_filter(explode("\n", $response->content));

        return [
            'role' => $role,
            'company' => $company,
            'bullets' => array_values($improvedBullets),
            'model' => $response->model,
        ];
    }

    /**
     * Improve project description.
     */
    public function improveProject(Resume $resume, User $user, array $data): array
    {
        $name = $data['name'] ?? 'Project';
        $description = $data['description'] ?? '';
        $technologies = is_array($data['technologies'] ?? null) ? $data['technologies'] : [];
        $language = $data['language'] ?? ($resume->language ?: 'en');

        $aiRequest = $this->promptService->buildProjectPrompt(
            name: (string) $name,
            description: (string) $description,
            technologies: $technologies,
            language: $language
        );

        $response = $this->aiEngine->execute(
            user: $user,
            request: $aiRequest,
            operationType: 'resume_project',
            resumeId: $resume->id
        );

        $json = $response->json();

        return [
            'description' => $json['description'] ?? $response->content,
            'highlights' => $json['highlights'] ?? [],
            'model' => $response->model,
        ];
    }

    /**
     * Suggest relevant skills.
     */
    public function suggestSkills(Resume $resume, User $user, array $data = []): array
    {
        $content = $resume->content ?? [];
        $basics = $content['basics'] ?? [];
        $experiences = $content['experiences'] ?? [];
        $existingSkills = $content['skill_groups'] ?? [];

        $language = $data['language'] ?? ($resume->language ?: 'en');
        $jobDescription = $data['job_description'] ?? null;

        $aiRequest = $this->promptService->buildSkillSuggestionsPrompt(
            headline: (string) ($basics['headline'] ?? $resume->title),
            experiences: $experiences,
            existingSkills: $existingSkills,
            language: $language,
            jobDescription: $jobDescription
        );

        $response = $this->aiEngine->execute(
            user: $user,
            request: $aiRequest,
            operationType: 'resume_skills',
            resumeId: $resume->id
        );

        $json = $response->json();
        $groups = $json['skill_groups'] ?? [];

        return [
            'skill_groups' => $groups,
            'model' => $response->model,
        ];
    }
}
