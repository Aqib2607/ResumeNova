<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\DTOs\AIRequest;
use App\Models\AtsAnalysis;
use App\Models\Resume;
use App\Models\User;
use App\Services\AI\AIEngineService;
use Throwable;

class AtsAnalyzerService
{
    public function __construct(
        protected AIEngineService $aiEngine
    ) {}

    /**
     * Analyze a resume against a job description using hybrid evaluation.
     */
    public function analyze(User $user, Resume $resume, string $jobDescription): AtsAnalysis
    {
        $resumeText = $this->extractResumeText($resume);
        $candidateSkills = $this->extractResumeSkills($resume);

        // Step 1: Deterministic Keyword Analysis
        $keywordAnalysis = $this->extractKeywordMetrics($resumeText, $jobDescription, $candidateSkills);

        // Step 2: Groq Semantic Evaluation
        $aiAnalysis = $this->evaluateWithGroq($user, $resume, $resumeText, $jobDescription, $keywordAnalysis);

        // Step 3: Composite Score calculation
        $deterministicScore = $keywordAnalysis['score'];
        $semanticScore = (int) ($aiAnalysis['semantic_score'] ?? $deterministicScore);
        $compositeScore = (int) round(($deterministicScore * 0.45) + ($semanticScore * 0.55));
        $compositeScore = max(10, min(100, $compositeScore));

        $feedback = [
            'job_description_snippet' => substr($jobDescription, 0, 300) . '...',
            'overall_score' => $compositeScore,
            'deterministic_score' => $deterministicScore,
            'semantic_score' => $semanticScore,
            'matched_skills' => $keywordAnalysis['matched_skills'],
            'missing_skills' => $keywordAnalysis['missing_skills'],
            'keywords' => $keywordAnalysis['keywords'],
            'strengths' => $aiAnalysis['strengths'] ?? [
                'Solid baseline match with the specified job requirements.',
            ],
            'weaknesses' => $aiAnalysis['weaknesses'] ?? [],
            'recommendations' => $aiAnalysis['recommendations'] ?? [
                'Incorporate more missing keywords directly into your experience bullet points.',
                'Quantify accomplishments with measurable percentages, revenue, or efficiency numbers.',
            ],
            'model' => $aiAnalysis['model'] ?? 'llama-3.3-70b-versatile',
        ];

        // Step 4: Persist in database
        return AtsAnalysis::create([
            'user_id' => $user->id,
            'resume_id' => $resume->id,
            'score' => $compositeScore,
            'feedback' => $feedback,
        ]);
    }

    /**
     * Convert resume content into plain text for NLP and matching.
     */
    protected function extractResumeText(Resume $resume): string
    {
        $content = $resume->content ?? [];
        $parts = [];

        $parts[] = "Title: " . ($resume->title ?: '');

        $basics = $content['basics'] ?? [];
        if (!empty($basics['headline'])) $parts[] = "Headline: " . $basics['headline'];
        if (!empty($basics['summary'])) $parts[] = "Summary: " . $basics['summary'];

        $experiences = $content['experiences'] ?? [];
        foreach ($experiences as $exp) {
            $role = $exp['role'] ?? '';
            $company = $exp['company'] ?? '';
            $bullets = implode(' ', $exp['bullets'] ?? []);
            $parts[] = "Experience: {$role} at {$company}. {$bullets}";
        }

        $skills = $content['skill_groups'] ?? [];
        foreach ($skills as $sg) {
            $cat = $sg['category'] ?? 'Skills';
            $items = implode(', ', $sg['skills'] ?? []);
            $parts[] = "{$cat}: {$items}";
        }

        $education = $content['education'] ?? [];
        foreach ($education as $edu) {
            $parts[] = "Education: " . ($edu['degree'] ?? '') . ' in ' . ($edu['field'] ?? '') . ' from ' . ($edu['school'] ?? '');
        }

        return implode("\n", $parts);
    }

    /**
     * Extract flat array of skills from resume.
     *
     * @return array<int, string>
     */
    protected function extractResumeSkills(Resume $resume): array
    {
        $content = $resume->content ?? [];
        $skillGroups = $content['skill_groups'] ?? [];
        $skills = [];

        foreach ($skillGroups as $group) {
            if (!empty($group['skills']) && is_array($group['skills'])) {
                foreach ($group['skills'] as $s) {
                    if (is_string($s) && trim($s)) {
                        $skills[] = trim($s);
                    }
                }
            }
        }

        return array_values(array_unique($skills));
    }

    /**
     * Deterministic keyword extraction and matching.
     */
    protected function extractKeywordMetrics(string $resumeText, string $jobDescription, array $candidateSkills): array
    {
        $lowerResume = strtolower($resumeText);
        $lowerJd = strtolower($jobDescription);

        // Common tech keywords catalog
        $commonKeywords = [
            'react', 'vue', 'angular', 'next.js', 'typescript', 'javascript', 'html', 'css', 'tailwind',
            'node.js', 'express', 'nestjs', 'php', 'laravel', 'symfony', 'python', 'django', 'fastapi',
            'golang', 'java', 'spring boot', 'c#', '.net', 'rust', 'ruby', 'rails', 'sql', 'mysql',
            'postgresql', 'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest api', 'microservices',
            'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'ci/cd', 'github actions', 'git', 'linux',
            'agile', 'scrum', 'tdd', 'unit testing', 'system design', 'architecture', 'lead', 'optimization',
        ];

        // Add candidate's own skills to keyword pool
        foreach ($candidateSkills as $skill) {
            $lowerSkill = strtolower(trim($skill));
            if (!in_array($lowerSkill, $commonKeywords, true)) {
                $commonKeywords[] = $lowerSkill;
            }
        }

        $keywords = [];
        $matchedCount = 0;
        $totalJdKeywords = 0;
        $matchedSkills = [];
        $missingSkills = [];

        foreach ($commonKeywords as $term) {
            $inJd = str_contains($lowerJd, $term);
            $inResume = str_contains($lowerResume, $term);

            if ($inJd) {
                $totalJdKeywords++;
                $frequency = substr_count($lowerResume, $term);

                $keywords[] = [
                    'keyword' => ucwords($term),
                    'in_resume' => $inResume,
                    'in_jd' => true,
                    'frequency' => $frequency,
                ];

                if ($inResume) {
                    $matchedCount++;
                    $matchedSkills[] = ucwords($term);
                } else {
                    $missingSkills[] = ucwords($term);
                }
            }
        }

        // Calculate deterministic score
        $score = $totalJdKeywords > 0
            ? (int) round(($matchedCount / $totalJdKeywords) * 100)
            : 70;

        return [
            'score' => max(20, min(100, $score)),
            'matched_skills' => array_slice($matchedSkills, 0, 15),
            'missing_skills' => array_slice($missingSkills, 0, 15),
            'keywords' => array_slice($keywords, 0, 25),
        ];
    }

    /**
     * Groq Semantic Analysis for deep fit and prioritized recommendations.
     */
    protected function evaluateWithGroq(
        User $user,
        Resume $resume,
        string $resumeText,
        string $jobDescription,
        array $keywordMetrics
    ): array {
        $systemPrompt = <<<SYS
You are an expert ATS (Applicant Tracking System) recruiter and technical hiring manager.
Evaluate the candidate's resume against the target job description.
Assess:
1. Candidate's core qualification fit (score 0-100)
2. Concrete strengths
3. Key missing competencies or weaknesses
4. 3 to 5 actionable, prioritized recommendations to maximize interview callbacks.

Return ONLY valid JSON in the format:
{
  "semantic_score": 85,
  "strengths": ["Clear demonstrable fullstack experience in Laravel and React."],
  "weaknesses": ["Lacks explicit mention of CI/CD and automated test coverage."],
  "recommendations": [
    "Add Docker and CI/CD pipelines under Skills and Experience sections.",
    "Quantify database optimization metrics in your current role."
  ]
}
SYS;

        $userPrompt = "Candidate Resume:\n{$resumeText}\n\nTarget Job Description:\n{$jobDescription}\n";

        $aiRequest = new AIRequest(
            userPrompt: $userPrompt,
            systemPrompt: $systemPrompt,
            temperature: 0.3,
            maxTokens: 800,
            responseFormat: 'json_object'
        );

        try {
            $response = $this->aiEngine->execute(
                user: $user,
                request: $aiRequest,
                operationType: 'ats_analysis',
                resumeId: $resume->id
            );

            $json = $response->json();

            return [
                'semantic_score' => $json['semantic_score'] ?? $keywordMetrics['score'],
                'strengths' => $json['strengths'] ?? [],
                'weaknesses' => $json['weaknesses'] ?? [],
                'recommendations' => $json['recommendations'] ?? [],
                'model' => $response->model,
            ];
        } catch (Throwable) {
            // Fall back gracefully to deterministic metrics if AI failover is exhausted
            return [
                'semantic_score' => $keywordMetrics['score'],
                'strengths' => ['Matches ' . count($keywordMetrics['matched_skills']) . ' core requirements.'],
                'weaknesses' => ['Missing ' . count($keywordMetrics['missing_skills']) . ' specified keywords.'],
                'recommendations' => [
                    'Incorporate missing keywords: ' . implode(', ', array_slice($keywordMetrics['missing_skills'], 0, 5)),
                    'Add measurable impact metrics to your recent positions.',
                ],
                'model' => 'deterministic-fallback',
            ];
        }
    }
}
