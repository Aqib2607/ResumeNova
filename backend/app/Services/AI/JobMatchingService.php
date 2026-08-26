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

        // Convert structured JSON resume into readable text if needed
        if (is_array($resumeText) || (is_string($resumeText) && str_starts_with(trim((string)$resumeText), '{'))) {
            $parsedJson = is_array($resumeText) ? $resumeText : json_decode((string)$resumeText, true);
            if (is_array($parsedJson)) {
                $lines = [];
                $title = $parsedJson['basics']['headline'] ?? $parsedJson['basics']['title'] ?? '';
                if (!empty($title)) {
                    $lines[] = "Professional Headline/Title: " . $title;
                }
                if (!empty($parsedJson['basics']['summary'])) {
                    $lines[] = "Summary: " . $parsedJson['basics']['summary'];
                }
                if (!empty($parsedJson['basics']['location'])) {
                    $lines[] = "Location: " . $parsedJson['basics']['location'];
                }
                if (!empty($parsedJson['skill_groups'])) {
                    $lines[] = "Skills & Technologies:";
                    foreach ($parsedJson['skill_groups'] as $group) {
                        $gName = $group['category'] ?? $group['name'] ?? 'Technical';
                        $gSkills = implode(', ', (array) ($group['skills'] ?? []));
                        $lines[] = "  - {$gName}: {$gSkills}";
                    }
                }
                if (!empty($parsedJson['experience'])) {
                    $lines[] = "Work Experience:";
                    foreach ($parsedJson['experience'] as $exp) {
                        $pos = $exp['position'] ?? 'Role';
                        $comp = $exp['company'] ?? 'Company';
                        $desc = $exp['description'] ?? '';
                        $lines[] = "  - {$pos} at {$comp}: {$desc}";
                    }
                }
                if (!empty($parsedJson['projects'])) {
                    $lines[] = "Projects:";
                    foreach ($parsedJson['projects'] as $proj) {
                        $pName = $proj['name'] ?? 'Project';
                        $pDesc = $proj['description'] ?? '';
                        $pTech = implode(', ', (array) ($proj['technologies'] ?? []));
                        $lines[] = "  - {$pName} ({$pTech}): {$pDesc}";
                    }
                }
                if (!empty($lines)) {
                    $resumeText = implode("\n", $lines);
                }
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

        $skillsReq = is_array($jobPosting->skills_required) ? implode(', ', $jobPosting->skills_required) : (string) $jobPosting->skills_required;
        $jobText = "Title: {$jobPosting->title}\n" .
                   "Company: {$jobPosting->company}\n" .
                   "Location: {$jobPosting->location}\n" .
                   "Work Mode: {$jobPosting->work_mode}\n" .
                   "Employment Type: {$jobPosting->employment_type}\n" .
                   ($skillsReq ? "Required Skills: {$skillsReq}\n\n" : "\n") .
                   "Job Description:\n" . substr((string)$jobPosting->description, 0, 2500);

        $userPrompt = "Candidate Profile:\n{$sanitizedResume}{$preferenceContext}\n\nTarget Job Posting:\n{$jobText}";

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
            // Intelligent heuristic fallback
            $resumeLower = strtolower((string)$resumeText);
            $jobSkills = is_array($jobPosting->skills_required) ? $jobPosting->skills_required : [];
            $matched = [];
            $missing = [];
            foreach ($jobSkills as $js) {
                $jsTrim = trim((string)$js);
                if (empty($jsTrim)) continue;
                if (stripos($resumeLower, strtolower($jsTrim)) !== false) {
                    $matched[] = $jsTrim;
                } else {
                    $missing[] = $jsTrim;
                }
            }
            $total = count($jobSkills);
            if ($total > 0) {
                $score = (int) round((count($matched) / $total) * 100);
            } else {
                // Check title keywords
                $titleWords = array_filter(explode(' ', strtolower($jobPosting->title)));
                $titleMatches = 0;
                foreach ($titleWords as $tw) {
                    if (strlen($tw) > 3 && stripos($resumeLower, $tw) !== false) {
                        $titleMatches++;
                    }
                }
                $score = $titleMatches > 0 ? 70 : 40;
            }
            $score = max(15, min(95, $score));
            $matchedSkills = $matched;
            $missingSkills = $missing;
            $reasoning = "Compatibility evaluation: Found " . count($matched) . " matching competencies (" . implode(', ', array_slice($matched, 0, 4)) . ") relevant to this role.";
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
