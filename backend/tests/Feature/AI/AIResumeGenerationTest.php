<?php

declare(strict_types=1);

use App\Contracts\AIProviderInterface;
use App\DTOs\AIProviderResponse;
use App\DTOs\AIRequest;
use App\Models\ApiKey;
use App\Models\Resume;
use App\Models\User;

test('unauthenticated user cannot call ai resume generation endpoints', function () {
    $resume = Resume::factory()->create();

    $this->postJson("/api/resumes/{$resume->id}/ai/summary")->assertStatus(401);
    $this->postJson("/api/resumes/{$resume->id}/ai/experience", ['bullets' => ['Built X']])->assertStatus(401);
    $this->postJson("/api/resumes/{$resume->id}/ai/project", ['name' => 'App'])->assertStatus(401);
    $this->postJson("/api/resumes/{$resume->id}/ai/skills")->assertStatus(401);
});

test('user cannot generate ai content for someone elses resume', function () {
    $owner = User::factory()->create();
    $attacker = User::factory()->create();
    $resume = Resume::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($attacker)
        ->postJson("/api/resumes/{$resume->id}/ai/summary")
        ->assertStatus(403);
});

test('user can generate ai summary with failover infrastructure', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->create([
        'user_id' => $user->id,
        'title' => 'Senior Backend Developer',
        'content' => [
            'basics' => [
                'full_name' => 'John Doe',
                'headline' => 'Lead Laravel Engineer',
            ],
            'experiences' => [
                [
                    'role' => 'Lead Developer',
                    'company' => 'Tech Corp',
                    'bullets' => ['Built scalable microservices.'],
                ],
            ],
            'skill_groups' => [],
        ],
    ]);

    ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Test Groq Key',
        'provider' => 'groq',
        'key' => 'gsk_test12345678',
        'masked_key' => 'gsk_••••5678',
        'priority' => 1,
        'status' => 'active',
    ]);

    // Mock AIProvider
    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('getProviderName')->andReturn('groq');
    $mockProvider->shouldReceive('generate')
        ->once()
        ->andReturn(new AIProviderResponse(
            content: '{"summary": "Experienced Lead Laravel Engineer with a track record of building scalable microservices."}',
            model: 'llama-3.3-70b-versatile',
            parsedJson: [
                'summary' => 'Experienced Lead Laravel Engineer with a track record of building scalable microservices.',
            ]
        ));

    app()->instance(AIProviderInterface::class, $mockProvider);

    $response = $this->actingAs($user)
        ->postJson("/api/resumes/{$resume->id}/ai/summary", [
            'language' => 'en',
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('summary', 'Experienced Lead Laravel Engineer with a track record of building scalable microservices.')
        ->assertJsonPath('model', 'llama-3.3-70b-versatile');
});

test('user can improve experience bullets with ai', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->create(['user_id' => $user->id]);

    ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Test Key',
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
            content: '{"bullets": ["Architected distributed event-driven pipeline, improving throughput by 45%."]}',
            model: 'llama-3.3-70b-versatile',
            parsedJson: [
                'bullets' => ['Architected distributed event-driven pipeline, improving throughput by 45%.'],
            ]
        ));

    app()->instance(AIProviderInterface::class, $mockProvider);

    $response = $this->actingAs($user)
        ->postJson("/api/resumes/{$resume->id}/ai/experience", [
            'role' => 'Software Engineer',
            'company' => 'Acme Inc',
            'bullets' => ['Worked on pipeline.'],
        ]);

    $response->assertStatus(200)
        ->assertJsonPath('bullets.0', 'Architected distributed event-driven pipeline, improving throughput by 45%.');
});
