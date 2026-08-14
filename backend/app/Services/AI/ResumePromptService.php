<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\DTOs\AIRequest;

class ResumePromptService
{
    /**
     * Build an AIRequest for generating or enhancing a professional summary.
     */
    public function buildSummaryPrompt(
        string $headline,
        array $experiences,
        array $skills,
        string $language = 'en',
        ?string $currentSummary = null,
        ?string $targetRole = null
    ): AIRequest {
        $langInstruction = $language === 'bn'
            ? 'Output the summary in natural, professional Bengali (Bangla).'
            : 'Output the summary in clear, impactful English.';

        $systemPrompt = <<<SYS
You are an expert executive resume writer and career strategist.
Generate a concise, impactful 3-4 sentence professional summary that emphasizes key achievements, domain expertise, and career value.
Follow modern ATS resume guidelines. Do not invent false metrics or certifications.
{$langInstruction}
Return ONLY valid JSON with the format:
{
  "summary": "The generated professional summary..."
}
SYS;

        $expList = [];
        foreach ($experiences as $exp) {
            $role = $exp['role'] ?? '';
            $company = $exp['company'] ?? '';
            $bullets = implode('; ', $exp['bullets'] ?? []);
            if ($role || $company) {
                $expList[] = "- {$role} at {$company}: {$bullets}";
            }
        }
        $expStr = implode("\n", $expList) ?: 'None provided';

        $skillList = [];
        foreach ($skills as $sg) {
            $cat = $sg['category'] ?? 'Skills';
            $items = implode(', ', $sg['skills'] ?? []);
            $skillList[] = "{$cat}: {$items}";
        }
        $skillStr = implode("\n", $skillList) ?: 'None provided';

        $userPrompt = "Target Headline / Role: " . ($targetRole ?: $headline ?: 'Professional') . "\n";
        if (!empty($currentSummary)) {
            $userPrompt .= "Existing Summary to Improve: {$currentSummary}\n";
        }
        $userPrompt .= "Key Experience History:\n{$expStr}\n\nKey Skills:\n{$skillStr}\n";

        return new AIRequest(
            userPrompt: $userPrompt,
            systemPrompt: $systemPrompt,
            temperature: 0.7,
            maxTokens: 500,
            responseFormat: 'json_object'
        );
    }

    /**
     * Build an AIRequest for polishing experience bullet points.
     */
    public function buildExperiencePrompt(
        string $role,
        string $company,
        array $currentBullets,
        string $language = 'en',
        ?string $jobDescription = null
    ): AIRequest {
        $langInstruction = $language === 'bn'
            ? 'Output bullets in professional Bengali (Bangla).'
            : 'Output bullets in clear, high-impact English.';

        $systemPrompt = <<<SYS
You are an elite career coach specialized in crafting compelling resume experience achievements using the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
Transform raw duty descriptions into action-oriented, quantifiable bullet points starting with strong action verbs.
{$langInstruction}
Return ONLY valid JSON in the format:
{
  "bullets": [
    "Action-oriented bullet 1...",
    "Action-oriented bullet 2..."
  ]
}
SYS;

        $bulletsStr = implode("\n", $currentBullets);
        $userPrompt = "Role: {$role}\nCompany: {$company}\n";
        if (!empty($jobDescription)) {
            $userPrompt .= "Target Job Description Context: {$jobDescription}\n";
        }
        $userPrompt .= "Current Bullets:\n{$bulletsStr}";

        return new AIRequest(
            userPrompt: $userPrompt,
            systemPrompt: $systemPrompt,
            temperature: 0.6,
            maxTokens: 600,
            responseFormat: 'json_object'
        );
    }

    /**
     * Build an AIRequest for improving project description.
     */
    public function buildProjectPrompt(
        string $name,
        ?string $description,
        array $technologies = [],
        string $language = 'en'
    ): AIRequest {
        $langInstruction = $language === 'bn' ? 'in Bengali (Bangla)' : 'in English';

        $systemPrompt = <<<SYS
You are an expert technical resume writer. Enhance the project description {$langInstruction} to showcase technical complexity, problem solved, and measurable outcomes.
Return ONLY valid JSON in the format:
{
  "description": "Enhanced project overview...",
  "highlights": ["Key technical highlight 1", "Key technical highlight 2"]
}
SYS;

        $techStr = implode(', ', $technologies);
        $userPrompt = "Project Name: {$name}\nTechnologies: {$techStr}\nDescription: {$description}";

        return new AIRequest(
            userPrompt: $userPrompt,
            systemPrompt: $systemPrompt,
            temperature: 0.7,
            maxTokens: 500,
            responseFormat: 'json_object'
        );
    }

    /**
     * Build an AIRequest for suggesting tailored skills.
     */
    public function buildSkillSuggestionsPrompt(
        string $headline,
        array $experiences,
        array $existingSkills,
        string $language = 'en',
        ?string $jobDescription = null
    ): AIRequest {
        $systemPrompt = <<<SYS
You are an ATS skill matching specialist. Suggest the top relevant technical and core professional skills for this candidate profile and target role.
Group skills logically into categories.
Return ONLY valid JSON in the format:
{
  "skill_groups": [
    {
      "category": "Technical Skills",
      "skills": ["React", "TypeScript", "Node.js"]
    },
    {
      "category": "Architecture & Tools",
      "skills": ["Docker", "REST APIs", "Microservices"]
    }
  ]
}
SYS;

        $expSummary = [];
        foreach ($experiences as $exp) {
            $expSummary[] = ($exp['role'] ?? '') . ' at ' . ($exp['company'] ?? '');
        }

        $userPrompt = "Headline: {$headline}\nExperience: " . implode(', ', $expSummary) . "\n";
        if (!empty($jobDescription)) {
            $userPrompt .= "Target Job Description: {$jobDescription}\n";
        }

        return new AIRequest(
            userPrompt: $userPrompt,
            systemPrompt: $systemPrompt,
            temperature: 0.5,
            maxTokens: 600,
            responseFormat: 'json_object'
        );
    }
}
