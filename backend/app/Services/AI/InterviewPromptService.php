<?php

declare(strict_types=1);

namespace App\Services\AI;

class InterviewPromptService
{
    /**
     * Build prompt to generate tailored interview questions.
     *
     * @param array<string, mixed> $resumeData
     */
    public function buildQuestionsPrompt(
        array $resumeData,
        ?string $jobDescription,
        string $category = 'technical',
        string $difficulty = 'medium',
        string $language = 'en',
        int $count = 5,
    ): array {
        $langInstruction = str_starts_with($language, 'bn')
            ? 'Output the questions, hints, and expected answers in natural, professional Bangla (বাংলা).'
            : 'Output the questions, hints, and expected answers in professional English.';

        $systemPrompt = <<<SYS
You are an expert technical recruiter, hiring manager, and interview coach.
Generate exactly {$count} rigorous, realistic interview questions tailored to the candidate's background and target role.
Category: {$category}
Difficulty level: {$difficulty}
Language instruction: {$langInstruction}

You must return ONLY valid, raw JSON matching this schema:
{
  "questions": [
    {
      "question": "Clear, detailed question text",
      "category": "{$category}",
      "difficulty": "{$difficulty}",
      "hints": ["Hint 1 to help structure the answer", "Hint 2 focusing on STAR or key metrics"],
      "expected_answer": "Key technical or behavioral points a strong candidate must cover"
    }
  ]
}
SYS;

        $userPrompt = "Candidate Profile & Resume Data:\n".json_encode($resumeData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        if (!empty($jobDescription)) {
            $userPrompt .= "\n\nTarget Job Description:\n".trim($jobDescription);
        }

        $userPrompt .= "\n\nGenerate {$count} {$difficulty} level {$category} interview questions now.";

        return [
            'system' => $systemPrompt,
            'user' => $userPrompt,
        ];
    }

    /**
     * Build prompt to evaluate user's answer to an interview question.
     */
    public function buildEvaluationPrompt(
        string $question,
        string $expectedAnswer,
        string $userAnswer,
        string $language = 'en',
    ): array {
        $langInstruction = str_starts_with($language, 'bn')
            ? 'Provide the evaluation, feedback, strengths, and improvement suggestions in natural, encouraging Bangla (বাংলা).'
            : 'Provide the evaluation, feedback, strengths, and improvement suggestions in professional, constructive English.';

        $systemPrompt = <<<SYS
You are an expert hiring manager evaluating a candidate's answer to an interview question.
Assess the response rigorously based on relevance, depth, clarity, and structure (such as the STAR method for behavioral questions).
Language instruction: {$langInstruction}

You must return ONLY valid, raw JSON matching this schema:
{
  "score": 85,
  "feedback": "Comprehensive, constructive assessment of the response",
  "strengths": ["Clear articulation of technical concept", "Good use of metrics"],
  "improvements": ["Could provide more specific examples of handling scale", "Mention unit testing"]
}
SYS;

        $userPrompt = "Interview Question: {$question}\n\n";
        $userPrompt .= "Expected Guidance: {$expectedAnswer}\n\n";
        $userPrompt .= "Candidate Answer:\n{$userAnswer}\n\n";
        $userPrompt .= "Evaluate the answer and provide score (0-100), feedback, strengths, and improvements in JSON format.";

        return [
            'system' => $systemPrompt,
            'user' => $userPrompt,
        ];
    }
}
