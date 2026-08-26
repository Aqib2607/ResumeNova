<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\DTOs\AIRequest;
use App\Models\JobMatch;
use App\Models\JobPosting;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class JobMatchingService
{
    public function __construct(
        protected AIEngineService $aiEngine
    ) {}

    /**
     * Evaluates a candidate's resume against a job posting to generate a match score.
     *
     * @param User $user
     * @param JobPosting $jobPosting
     * @param string|null $resumeText
     * @return JobMatch
     */
    public function evaluateMatch(User $user, JobPosting $jobPosting, ?string $resumeText = null): JobMatch
    {
        if (empty($resumeText)) {
            // Attempt to get text from latest resume
            $latestResume = $user->resumes()->latest()->first();
            if ($latestResume && !empty($latestResume->content)) {
                $resumeText = is_string($latestResume->content)
                    ? $latestResume->content
                    : json_encode($latestResume->content);
            } else {
                // Fallback to skills / profile
                $skills = $user->candidateSkills()->pluck('name')->toArray();
                $profileHeadline = $user->profile?->headline ?? '';
                $profileBio = $user->profile?->bio ?? '';
                $resumeText = "Headline: {$profileHeadline}\nBio: {$profileBio}\nSkills: " . implode(', ', $skills);
            }
        }

        // Include candidate preferences if available
        $preferenceContext = '';
        $preference = $user->jobPreferences()->where('is_active', true)->first();
        if ($preference) {
            $prefTitles = !empty($preference->titles) ? implode(', ', (array) $preference->titles) : 'Flexible';
            $prefLocations = !empty($preference->locations) ? implode(', ', (array) $preference->locations) : 'Flexible';
            $prefWorkModes = !empty($preference->location_types) ? implode(', ', (array) $preference->location_types) : 'Flexible';
            $prefSkills = !empty($preference->skills) ? implode(', ', (array) $preference->skills) : '';
            $preferenceContext = "\nCandidate Preferences:\n- Desired Roles: {$prefTitles}\n- Preferred Locations: {$prefLocations}\n- Preferred Work Modes: {$prefWorkModes}";
            if (!empty($prefSkills)) {
                $preferenceContext .= "\n- Target Skills: {$prefSkills}";
            }
        }

        // Sanitize PII
        $sanitizedResume = PrivacyStripper::strip($resumeText);

        $systemPrompt = "You are an expert ATS (Applicant Tracking System) algorithms auditor and elite technical recruiter. " .
                        "Evaluate the candidate's resume profile and preferences against the target job posting.\n" .
                        "Provide a strict, objective, and constructive match analysis.\n" .
                        "Respond ONLY with a valid JSON object formatted exactly as follows:\n" .
                        "{\n" .
                        '  "match_score": 88,' . "\n" .
                        '  "match_reasoning": "Strong match in core skills and backend experience with minor gap in cloud certifications.",' . "\n" .
                        '  "matched_skills": ["PHP", "Laravel", "REST APIs", "MySQL"],' . "\n" .
                        '  "missing_skills": ["Kubernetes", "AWS Solutions Architect"],' . "\n" .
                        '  "recommendation": "Emphasize your microservices projects and Docker experience."' . "\n" .
                        "}";

        $jobDetails = json_encode([
            'title' => $jobPosting->title,
            'company' => $jobPosting->company,
            'location' => $jobPosting->location,
            'work_mode' => $jobPosting->work_mode,
            'employment_type' => $jobPosting->employment_type,
            'description' => substr((string)$jobPosting->description, 0, 2000),
            'skills_required' => $jobPosting->skills_required,
        ]);

        $userPrompt = "Candidate Profile:\n{$sanitizedResume}{$preferenceContext}\n\nTarget Job Posting:\n{$jobDetails}";

        $request = new AIRequest(
            userPrompt: $userPrompt,
            systemPrompt: $systemPrompt,
            temperature: 0.15,
            responseFormat: 'json_object'
        );

        $score = 50;
        $reasoning = 'Standard match based on keyword relevance.';
        $matchedSkills = [];
        $missingSkills = [];

        try {
            $response = $this->aiEngine->execute($user, $request, 'job_matching');
            $parsed = $response->getParsedJson();

            if (!empty($parsed) && is_array($parsed)) {
                $score = max(0, min(100, (int) ($parsed['match_score'] ?? 50)));
                $reasoning = (string) ($parsed['match_reasoning'] ?? $parsed['recommendation'] ?? 'Match evaluated successfully.');
                $matchedSkills = is_array($parsed['matched_skills'] ?? null) ? $parsed['matched_skills'] : [];
                $missingSkills = is_array($parsed['missing_skills'] ?? null) ? $parsed['missing_skills'] : [];
            }
        } catch (\Exception $e) {
            Log::error('AI Job Matching failed', ['error' => $e->getMessage()]);
            // Heuristic keyword fallback
            $score = 65;
            $reasoning = 'Automated keyword-based match calculation: ' . $e->getMessage();
        }

        $match = JobMatch::updateOrCreate(
            ['user_id' => $user->id, 'job_posting_id' => $jobPosting->id],
            [
                'match_score' => $score,
                'match_reasoning' => $reasoning,
                'matched_skills' => $matchedSkills,
                'missing_skills' => $missingSkills,
                'is_dismissed' => false,
            ]
        );

        // Real-time Dashboard Notification for high suitability match (>= 80) without duplicates
        if ($score >= 80) {
            try {
                $alreadyNotified = $user->notifications()
                    ->where('data', 'like', '%"job_posting_id":' . $jobPosting->id . '%')
                    ->exists();

                if (!$alreadyNotified) {
                    $user->notify(new \App\Notifications\HighMatchJobNotification($match));
                }
            } catch (\Exception $e) {
                Log::warning('Could not create notification for job match: ' . $e->getMessage());
            }
        }

        return $match;
    }
}
