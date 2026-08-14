<?php

declare(strict_types=1);

namespace App\Services;

use App\DTOs\AIRequest;
use App\Models\InterviewQuestion;
use App\Models\InterviewSession;
use App\Models\Resume;
use App\Models\User;
use App\Services\AI\AIEngineService;
use App\Services\AI\InterviewPromptService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InterviewService
{
    public function __construct(
        protected AIEngineService $aiEngine,
        protected InterviewPromptService $promptService,
    ) {}

    /**
     * List paginated interview sessions for user.
     */
    public function listSessions(User $user, int $perPage = 10): LengthAwarePaginator
    {
        return InterviewSession::where('user_id', $user->id)
            ->with(['resume:id,title'])
            ->withCount('questions')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Create a new interview session and generate initial questions.
     *
     * @param array<string, mixed> $data
     */
    public function createSession(User $user, array $data): InterviewSession
    {
        return DB::transaction(function () use ($user, $data) {
            $session = InterviewSession::create([
                'user_id' => $user->id,
                'resume_id' => $data['resume_id'] ?? null,
                'category' => $data['category'] ?? 'technical',
                'difficulty' => $data['difficulty'] ?? 'medium',
                'language' => $data['language'] ?? 'en',
                'job_description' => $data['job_description'] ?? null,
                'total_questions' => (int) ($data['total_questions'] ?? 5),
                'completed_questions' => 0,
                'status' => 'in_progress',
            ]);

            $this->generateQuestionsForSession($session);

            return $session->fresh(['questions', 'resume']);
        });
    }

    /**
     * Generate questions for a given session using AI Engine.
     *
     * @return array<int, InterviewQuestion>
     */
    public function generateQuestionsForSession(InterviewSession $session): array
    {
        $resumeData = [];
        if ($session->resume_id) {
            $resume = Resume::find($session->resume_id);
            if ($resume) {
                $resumeData = [
                    'title' => $resume->title,
                    'summary' => $resume->summary,
                    'experience' => $resume->experience,
                    'skills' => $resume->skills,
                    'projects' => $resume->projects,
                ];
            }
        }

        $prompts = $this->promptService->buildQuestionsPrompt(
            resumeData: $resumeData,
            jobDescription: $session->job_description,
            category: $session->category,
            difficulty: $session->difficulty,
            language: $session->language,
            count: $session->total_questions,
        );

        $requestDto = new AIRequest(
            userPrompt: $prompts['user'],
            systemPrompt: $prompts['system'],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            responseFormat: 'json_object',
        );

        $response = $this->aiEngine->execute(
            user: $session->user,
            request: $requestDto,
            operationType: 'interview_question_generation',
            resumeId: $session->resume_id,
        );

        $parsed = $response->getParsedJson();
        $questionsData = $parsed['questions'] ?? [];

        if (empty($questionsData)) {
            // Fallback structured question if provider returns unconventional payload
            $questionsData = [
                [
                    'question' => "Explain a challenging project you worked on and the technical decisions you made.",
                    'category' => $session->category,
                    'difficulty' => $session->difficulty,
                    'hints' => ["Structure your answer with Situation, Task, Action, and Result (STAR).", "Quantify the outcome."],
                    'expected_answer' => "Clear problem statement, architecture choices, trade-offs, and measurable outcomes.",
                ]
            ];
        }

        $createdQuestions = [];
        $order = 1;

        foreach ($questionsData as $q) {
            $createdQuestions[] = InterviewQuestion::create([
                'session_id' => $session->id,
                'order' => $order++,
                'category' => $q['category'] ?? $session->category,
                'difficulty' => $q['difficulty'] ?? $session->difficulty,
                'question' => $q['question'] ?? 'Sample Question',
                'hints' => $q['hints'] ?? [],
                'expected_answer' => $q['expected_answer'] ?? null,
            ]);
        }

        $session->update(['total_questions' => count($createdQuestions)]);

        return $createdQuestions;
    }

    /**
     * Submit an answer for a question and evaluate with AI.
     */
    public function evaluateQuestionAnswer(InterviewQuestion $question, string $userAnswer): InterviewQuestion
    {
        $session = $question->session;

        $prompts = $this->promptService->buildEvaluationPrompt(
            question: $question->question,
            expectedAnswer: $question->expected_answer ?? 'Clear, structured, and relevant answer with measurable results.',
            userAnswer: $userAnswer,
            language: $session->language,
        );

        $requestDto = new AIRequest(
            userPrompt: $prompts['user'],
            systemPrompt: $prompts['system'],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.5,
            responseFormat: 'json_object',
        );

        $response = $this->aiEngine->execute(
            user: $session->user,
            request: $requestDto,
            operationType: 'interview_answer_evaluation',
            resumeId: $session->resume_id,
        );

        $evaluation = $response->getParsedJson();
        $score = isset($evaluation['score']) ? (int) $evaluation['score'] : 80;

        $question->update([
            'user_answer' => $userAnswer,
            'evaluation' => $evaluation,
            'score' => $score,
        ]);

        // Update session progress
        $completedCount = $session->questions()->whereNotNull('user_answer')->count();
        $isFinished = $completedCount >= $session->total_questions;

        $session->update([
            'completed_questions' => $completedCount,
            'status' => $isFinished ? 'completed' : 'in_progress',
        ]);

        return $question->fresh();
    }
}
