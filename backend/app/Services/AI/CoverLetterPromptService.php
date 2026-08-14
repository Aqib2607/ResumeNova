<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\DTOs\AIRequest;

class CoverLetterPromptService
{
    /**
     * Build prompt for generating a tailored cover letter.
     */
    public function buildCoverLetterPrompt(
        string $candidateName,
        string $candidateTitle,
        string $candidateProfileSummary,
        string $jobDescription,
        string $language = 'en',
        string $tone = 'professional',
        ?string $companyName = null
    ): AIRequest {
        $langInstruction = $language === 'bn'
            ? 'Write the ENTIRE cover letter in fluent, sophisticated, and professional Bengali (Bangla). Use appropriate formal Bengali honorifics and business salutations.'
            : 'Write the cover letter in compelling, polished, and natural English.';

        $toneInstruction = match ($tone) {
            'confident' => 'Adopt a confident, energetic, and highly capable tone showcasing leadership potential.',
            'conversational' => 'Adopt a warm, engaging, and personal conversational tone while maintaining professionalism.',
            'executive' => 'Adopt a strategic, senior-level executive tone emphasizing vision, ROI, and high-level organizational impact.',
            default => 'Adopt a formal, respectful, and articulate professional tone.',
        };

        $systemPrompt = <<<SYS
You are a premier executive career advisor and professional cover letter author.
Create an exceptional, customized cover letter that connects the candidate's exact background and accomplishments to the requirements outlined in the job description.
Structure:
1. Compelling opening stating enthusiasm for the role at the company and immediate value proposition.
2. 2-3 body paragraphs highlighting relevant technical/domain successes and aligning with the job requirements.
3. Confident closing with call to action.
{$langInstruction}
{$toneInstruction}

Return ONLY valid JSON in the format:
{
  "title": "Cover Letter - Position at Company",
  "content": "Full text of the cover letter including proper paragraphs..."
}
SYS;

        $userPrompt = "Candidate Name: {$candidateName}\nCandidate Current Title: {$candidateTitle}\n";
        if (!empty($companyName)) {
            $userPrompt .= "Target Company: {$companyName}\n";
        }
        $userPrompt .= "Candidate Background & Highlights:\n{$candidateProfileSummary}\n\nTarget Job Description:\n{$jobDescription}\n";

        return new AIRequest(
            userPrompt: $userPrompt,
            systemPrompt: $systemPrompt,
            temperature: 0.7,
            maxTokens: 1500,
            responseFormat: 'json_object'
        );
    }
}
