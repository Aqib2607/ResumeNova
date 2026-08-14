<?php

declare(strict_types=1);

use App\Contracts\AIProviderInterface;
use App\DTOs\AIProviderResponse;
use App\Models\ApiKey;
use App\Models\InterviewQuestion;
use App\Models\InterviewSession;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    // Create an active API key for user
    ApiKey::create([
        'user_id' => $this->user->id,
        'provider' => 'groq',
        'name' => 'Groq Primary Key',
        'key' => 'gsk_testkey1234567890abcdef',
        'status' => 'active',
        'priority' => 1,
    ]);

    $this->resume = Resume::factory()->create([
        'user_id' => $this->user->id,
        'title' => 'Senior Backend Engineer',
    ]);
});

test('unauthenticated users cannot access interview endpoints', function () {
    $this->getJson('/api/interviews')->assertStatus(401);
    $this->postJson('/api/interviews', [])->assertStatus(401);
});

test('user can create an interview session and questions are generated via ai', function () {
    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('getProviderName')->andReturn('groq');
    $mockProvider->shouldReceive('generate')
        ->once()
        ->andReturn(new AIProviderResponse(
            content: json_encode([
                'questions' => [
                    [
                        'question' => 'How do you handle database race conditions in Laravel?',
                        'category' => 'technical',
                        'difficulty' => 'hard',
                        'hints' => ['Consider pessimistic locking', 'Consider database transactions'],
                        'expected_answer' => 'Use DB transactions with lockForUpdate or optimistic locking with version columns.',
                    ],
                    [
                        'question' => 'Describe a time you resolved a conflict within your development team.',
                        'category' => 'behavioral',
                        'difficulty' => 'medium',
                        'hints' => ['Use STAR structure'],
                        'expected_answer' => 'Clear explanation of conflict, empathy, actionable solution, and team alignment.',
                    ]
                ]
            ]),
            model: 'llama-3.3-70b-versatile',
            usage: ['total_tokens' => 300],
        ));

    $this->app->instance(AIProviderInterface::class, $mockProvider);

    $response = $this->actingAs($this->user)->postJson('/api/interviews', [
        'resume_id' => $this->resume->id,
        'category' => 'technical',
        'difficulty' => 'hard',
        'language' => 'en',
        'total_questions' => 2,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.category', 'technical')
        ->assertJsonPath('data.difficulty', 'hard')
        ->assertJsonPath('data.total_questions', 2)
        ->assertJsonCount(2, 'data.questions');

    $this->assertDatabaseHas('interview_sessions', [
        'user_id' => $this->user->id,
        'resume_id' => $this->resume->id,
        'category' => 'technical',
        'status' => 'in_progress',
    ]);
});

test('user can answer an interview question and receive ai evaluation', function () {
    $session = InterviewSession::create([
        'user_id' => $this->user->id,
        'resume_id' => $this->resume->id,
        'category' => 'technical',
        'difficulty' => 'medium',
        'language' => 'en',
        'total_questions' => 1,
        'completed_questions' => 0,
        'status' => 'in_progress',
    ]);

    $question = InterviewQuestion::create([
        'session_id' => $session->id,
        'order' => 1,
        'category' => 'technical',
        'difficulty' => 'medium',
        'question' => 'What is the purpose of database indexes?',
        'hints' => ['Mention lookup speed vs write overhead'],
        'expected_answer' => 'Indexes speed up search operations using B-Tree data structures at the cost of additional storage and write latency.',
    ]);

    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('getProviderName')->andReturn('groq');
    $mockProvider->shouldReceive('generate')
        ->once()
        ->andReturn(new AIProviderResponse(
            content: json_encode([
                'score' => 90,
                'feedback' => 'Excellent answer that accurately captures indexing trade-offs.',
                'strengths' => ['Clear definition', 'Mentioned B-Trees and write overhead'],
                'improvements' => ['Could mention composite indexes'],
            ]),
            model: 'llama-3.3-70b-versatile',
            usage: ['total_tokens' => 200],
        ));

    $this->app->instance(AIProviderInterface::class, $mockProvider);

    $response = $this->actingAs($this->user)->postJson(
        "/api/interviews/{$session->id}/questions/{$question->id}/answer",
        [
            'answer' => 'Database indexes provide fast lookups using B-Tree data structures, improving SELECT queries but slightly slowing down INSERTs.',
        ]
    );

    $response->assertStatus(200)
        ->assertJsonPath('question.score', 90)
        ->assertJsonPath('session.completed_questions', 1)
        ->assertJsonPath('session.status', 'completed');

    expect($question->fresh()->score)->toBe(90)
        ->and($session->fresh()->status)->toBe('completed');
});

test('user cannot view or answer another users interview session', function () {
    $otherUser = User::factory()->create();

    $session = InterviewSession::create([
        'user_id' => $otherUser->id,
        'category' => 'technical',
        'status' => 'in_progress',
    ]);

    $this->actingAs($this->user)->getJson("/api/interviews/{$session->id}")
        ->assertStatus(403);

    $this->actingAs($this->user)->deleteJson("/api/interviews/{$session->id}")
        ->assertStatus(403);
});

test('user can list and delete their own interview sessions', function () {
    $session = InterviewSession::create([
        'user_id' => $this->user->id,
        'category' => 'behavioral',
        'status' => 'in_progress',
    ]);

    $response = $this->actingAs($this->user)->getJson('/api/interviews');
    $response->assertStatus(200)
        ->assertJsonCount(1, 'data');

    $deleteResponse = $this->actingAs($this->user)->deleteJson("/api/interviews/{$session->id}");
    $deleteResponse->assertStatus(200);

    $this->assertDatabaseMissing('interview_sessions', ['id' => $session->id]);
});
