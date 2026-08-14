<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\Interview\AnswerInterviewQuestionRequest;
use App\Http\Requests\Interview\CreateInterviewSessionRequest;
use App\Http\Resources\InterviewQuestionResource;
use App\Http\Resources\InterviewSessionResource;
use App\Models\InterviewQuestion;
use App\Models\InterviewSession;
use App\Services\InterviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;

class InterviewController extends Controller
{
    public function __construct(
        protected InterviewService $interviewService,
    ) {}

    /**
     * List current user's interview sessions.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->query('per_page', 10);
        $sessions = $this->interviewService->listSessions($request->user(), $perPage);

        return InterviewSessionResource::collection($sessions);
    }

    /**
     * Create a new interview session.
     */
    public function store(CreateInterviewSessionRequest $request): JsonResponse
    {
        $session = $this->interviewService->createSession(
            user: $request->user(),
            data: $request->validated(),
        );

        return (new InterviewSessionResource($session))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show single interview session with its questions.
     */
    public function show(Request $request, InterviewSession $interview): InterviewSessionResource
    {
        Gate::authorize('view', $interview);

        $interview->load(['questions', 'resume:id,title']);

        return new InterviewSessionResource($interview);
    }

    /**
     * Delete an interview session.
     */
    public function destroy(Request $request, InterviewSession $interview): JsonResponse
    {
        Gate::authorize('delete', $interview);

        $interview->delete();

        return response()->json([
            'message' => 'Interview session deleted successfully.',
        ]);
    }

    /**
     * Generate additional questions for an existing session.
     */
    public function generateQuestions(Request $request, InterviewSession $interview): JsonResponse
    {
        Gate::authorize('update', $interview);

        $questions = $this->interviewService->generateQuestionsForSession($interview);

        return response()->json([
            'message' => 'Questions generated successfully.',
            'questions' => InterviewQuestionResource::collection($questions),
        ]);
    }

    /**
     * Submit an answer and get AI evaluation for a question.
     */
    public function answer(
        AnswerInterviewQuestionRequest $request,
        InterviewSession $interview,
        InterviewQuestion $question,
    ): JsonResponse {
        Gate::authorize('update', $interview);

        if ($question->session_id !== $interview->id) {
            abort(404, 'Question not found in this interview session.');
        }

        $evaluatedQuestion = $this->interviewService->evaluateQuestionAnswer(
            question: $question,
            userAnswer: $request->validated('answer'),
        );

        return response()->json([
            'message' => 'Answer evaluated successfully.',
            'question' => new InterviewQuestionResource($evaluatedQuestion),
            'session' => new InterviewSessionResource($interview->fresh(['questions', 'resume'])),
        ]);
    }
}
