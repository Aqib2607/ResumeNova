<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Models\CoverLetter;
use App\Models\Resume;
use App\Models\User;
use App\Services\AI\AIEngineService;
use App\Services\AI\CoverLetterPromptService;
use InvalidArgumentException;

class AICoverLetterService
{
    public function __construct(
        protected AIEngineService $aiEngine,
        protected CoverLetterPromptService $promptService
    ) {}

    /**
     * Generate and persist an AI cover letter tailored to a job description and candidate background.
     */
    public function generate(User $user, array $data): CoverLetter
    {
        $jobDescription = trim((string) ($data['job_description'] ?? ''));
        if (empty($jobDescription) || strlen($jobDescription) < 15) {
            throw new InvalidArgumentException('Please provide a detailed job description.');
        }

        $language = $data['language'] ?? 'en';
        $tone = $data['tone'] ?? 'professional';
        $companyName = $data['company_name'] ?? null;
        $resumeId = !empty($data['resume_id']) ? (int) $data['resume_id'] : null;

        $candidateName = $user->name;
        $candidateTitle = 'Experienced Professional';
        $summaryParts = [];

        if ($resumeId) {
            $resume = Resume::where('user_id', $user->id)->find($resumeId);
            if ($resume) {
                $content = $resume->content ?? [];
                $basics = $content['basics'] ?? [];

                if (!empty($basics['full_name'])) {
                    $candidateName = $basics['full_name'];
                }
                if (!empty($basics['headline'])) {
                    $candidateTitle = $basics['headline'];
                }

                if (!empty($basics['summary'])) {
                    $summaryParts[] = "Summary: " . $basics['summary'];
                }

                $experiences = $content['experiences'] ?? [];
                foreach (array_slice($experiences, 0, 3) as $exp) {
                    $role = $exp['role'] ?? '';
                    $company = $exp['company'] ?? '';
                    $bullets = implode('; ', array_slice($exp['bullets'] ?? [], 0, 3));
                    if ($role) {
                        $summaryParts[] = "Experience: {$role} at {$company} ({$bullets})";
                    }
                }

                $skillGroups = $content['skill_groups'] ?? [];
                $skills = [];
                foreach ($skillGroups as $sg) {
                    $skills = array_merge($skills, $sg['skills'] ?? []);
                }
                if (!empty($skills)) {
                    $summaryParts[] = "Key Skills: " . implode(', ', array_slice($skills, 0, 15));
                }
            }
        }

        $candidateSummary = implode("\n", $summaryParts) ?: ($user->profile?->bio ?: 'Candidate with strong industry background');

        $aiRequest = $this->promptService->buildCoverLetterPrompt(
            candidateName: $candidateName,
            candidateTitle: $candidateTitle,
            candidateProfileSummary: $candidateSummary,
            jobDescription: $jobDescription,
            language: $language,
            tone: $tone,
            companyName: $companyName
        );

        $response = $this->aiEngine->execute(
            user: $user,
            request: $aiRequest,
            operationType: 'cover_letter',
            resumeId: $resumeId
        );

        $json = $response->json();
        $title = $json['title'] ?? ($data['title'] ?? 'Cover Letter - ' . date('M Y'));
        $content = $json['content'] ?? $response->content;

        return CoverLetter::create([
            'user_id' => $user->id,
            'resume_id' => $resumeId,
            'title' => $title,
            'language' => $language,
            'tone' => $tone,
            'job_description' => $jobDescription,
            'content' => $content,
        ]);
    }
}
