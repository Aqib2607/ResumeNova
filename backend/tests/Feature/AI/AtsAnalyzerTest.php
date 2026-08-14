<?php

declare(strict_types=1);

use App\Contracts\AIProviderInterface;
use App\DTOs\AIProviderResponse;
use App\Models\ApiKey;
use App\Models\AtsAnalysis;
use App\Models\Resume;
use App\Models\User;

test('unauthenticated users cannot access ats analyzer endpoints', function () {
    $this->postJson('/api/ats/analyze', ['resume_id' => 1, 'job_description' => 'Test'])->assertStatus(401);
    $this->getJson('/api/ats/history')->assertStatus(401);
});

test('user can run ats analysis and receive hybrid score and recommendations', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->create([
        'user_id' => $user->id,
        'title' => 'Senior Fullstack Engineer',
        'content' => [
            'basics' => [
                'full_name' => 'Jane Smith',
                'headline' => 'Fullstack Laravel & React Engineer',
            ],
            'experiences' => [
                [
                    'role' => 'Software Engineer',
                    'company' => 'Innovate Corp',
                    'bullets' => ['Built responsive React frontends and robust Laravel REST APIs.'],
                ],
            ],
            'skill_groups' => [
                [
                    'category' => 'Frontend',
                    'skills' => ['React', 'TypeScript', 'Tailwind'],
                ],
                [
                    'category' => 'Backend',
                    'skills' => ['PHP', 'Laravel', 'MySQL'],
                ],
            ],
        ],
    ]);

    ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Groq Key',
        'provider' => 'groq',
        'key' => 'gsk_test12345678',
        'masked_key' => 'gsk_••••5678',
        'priority' => 1,
        'status' => 'active',
    ]);

    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('getProviderName')->andReturn('groq');
    $mockProvider->shouldReceive('generate')
        ->once()
        ->andReturn(new AIProviderResponse(
            content: '{"semantic_score": 90, "strengths": ["Strong Laravel expertise"], "weaknesses": ["Missing Docker experience"], "recommendations": ["Add containerization metrics"]}',
            model: 'llama-3.3-70b-versatile',
            parsedJson: [
                'semantic_score' => 90,
                'strengths' => ['Strong Laravel expertise'],
                'weaknesses' => ['Missing Docker experience'],
                'recommendations' => ['Add containerization metrics'],
            ]
        ));

    app()->instance(AIProviderInterface::class, $mockProvider);

    $jobDescription = "We are seeking a Fullstack Developer experienced in React, TypeScript, Laravel, and MySQL. Docker experience is a plus.";

    $response = $this->actingAs($user)->postJson('/api/ats/analyze', [
        'resume_id' => $resume->id,
        'job_description' => $jobDescription,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.resume_id', $resume->id)
        ->assertJsonStructure([
            'data' => [
                'id',
                'resume_id',
                'score',
                'matched_skills',
                'missing_skills',
                'keywords',
                'recommendations',
                'created_at',
            ],
        ]);

    $this->assertDatabaseHas('ats_analyses', [
        'user_id' => $user->id,
        'resume_id' => $resume->id,
    ]);
});

test('user can list their own ats history', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $resume = Resume::factory()->create(['user_id' => $user->id]);
    $otherResume = Resume::factory()->create(['user_id' => $otherUser->id]);

    AtsAnalysis::create([
        'user_id' => $user->id,
        'resume_id' => $resume->id,
        'score' => 85,
        'feedback' => ['matched_skills' => ['Laravel']],
    ]);

    AtsAnalysis::create([
        'user_id' => $otherUser->id,
        'resume_id' => $otherResume->id,
        'score' => 60,
        'feedback' => ['matched_skills' => ['Python']],
    ]);

    $response = $this->actingAs($user)->getJson('/api/ats/history');

    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.score', 85);
});
