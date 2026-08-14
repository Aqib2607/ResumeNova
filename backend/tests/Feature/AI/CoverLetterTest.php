<?php

declare(strict_types=1);

use App\Contracts\AIProviderInterface;
use App\DTOs\AIProviderResponse;
use App\Models\ApiKey;
use App\Models\CoverLetter;
use App\Models\Resume;
use App\Models\User;

test('unauthenticated users cannot generate or manage cover letters', function () {
    $this->getJson('/api/cover-letters')->assertStatus(401);
    $this->postJson('/api/cover-letters/generate', ['job_description' => 'Test'])->assertStatus(401);
});

test('user can generate an ai cover letter with resume background context', function () {
    $user = User::factory()->create(['name' => 'Alex Johnson']);
    $resume = Resume::factory()->create([
        'user_id' => $user->id,
        'title' => 'Senior Fullstack Engineer',
        'content' => [
            'basics' => [
                'full_name' => 'Alex Johnson',
                'headline' => 'Lead Software Architect',
            ],
            'experiences' => [
                [
                    'role' => 'Principal Engineer',
                    'company' => 'Enterprise Inc',
                    'bullets' => ['Led 10 engineers in building distributed systems.'],
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
            content: '{"title": "Cover Letter - Lead Engineer at Vercel", "content": "Dear Hiring Manager, I am thrilled to apply for the Lead Engineer role..."}',
            model: 'llama-3.3-70b-versatile',
            parsedJson: [
                'title' => 'Cover Letter - Lead Engineer at Vercel',
                'content' => 'Dear Hiring Manager, I am thrilled to apply for the Lead Engineer role...',
            ]
        ));

    app()->instance(AIProviderInterface::class, $mockProvider);

    $response = $this->actingAs($user)->postJson('/api/cover-letters/generate', [
        'resume_id' => $resume->id,
        'language' => 'en',
        'tone' => 'professional',
        'company_name' => 'Vercel',
        'job_description' => 'Looking for a Lead Engineer to scale Next.js and serverless infrastructure.',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.title', 'Cover Letter - Lead Engineer at Vercel')
        ->assertJsonPath('data.language', 'en')
        ->assertJsonPath('data.content', 'Dear Hiring Manager, I am thrilled to apply for the Lead Engineer role...');

    $this->assertDatabaseHas('cover_letters', [
        'user_id' => $user->id,
        'resume_id' => $resume->id,
        'language' => 'en',
    ]);
});

test('user can list, update, and delete their own cover letters', function () {
    $user = User::factory()->create();

    $letter = CoverLetter::create([
        'user_id' => $user->id,
        'title' => 'Initial Title',
        'language' => 'en',
        'tone' => 'professional',
        'job_description' => 'Job description content here.',
        'content' => 'Dear Hiring Manager...',
    ]);

    // List
    $this->actingAs($user)->getJson('/api/cover-letters')
        ->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Initial Title');

    // Update
    $this->actingAs($user)->putJson("/api/cover-letters/{$letter->id}", [
        'title' => 'Updated Title',
        'content' => 'Updated content text...',
    ])->assertStatus(200)
      ->assertJsonPath('data.title', 'Updated Title');

    // Delete
    $this->actingAs($user)->deleteJson("/api/cover-letters/{$letter->id}")
        ->assertStatus(200);

    $this->assertDatabaseMissing('cover_letters', ['id' => $letter->id]);
});
