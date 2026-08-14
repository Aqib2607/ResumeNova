<?php

declare(strict_types=1);

use App\Models\CoverLetter;
use App\Models\Export;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
    $this->user = User::factory()->create();

    $this->resume = Resume::factory()->create([
        'user_id' => $this->user->id,
        'title' => 'Software Architect Resume',
        'content' => [
            'basics' => [
                'full_name' => 'Alice Johnson',
                'headline' => 'Principal Software Architect',
                'email' => 'alice@example.com',
                'phone' => '+1-555-0199',
                'location' => 'San Francisco, CA',
                'summary' => 'Seasoned systems architect with 10+ years designing distributed systems.',
            ],
            'experiences' => [
                [
                    'role' => 'Principal Architect',
                    'company' => 'TechCorp Global',
                    'location' => 'San Francisco, CA',
                    'period' => '2020 - Present',
                    'bullets' => [
                        'Scaled microservices handling 50k requests/sec with 99.99% uptime.',
                        'Mentored 15 senior engineers and defined core architectural RFCs.',
                    ],
                ],
            ],
            'education' => [
                [
                    'degree' => 'B.S. in Computer Science',
                    'institution' => 'Stanford University',
                    'year' => '2014',
                ],
            ],
            'projects' => [
                [
                    'name' => 'High-Throughput Message Queue',
                    'technologies' => 'Go, Kafka, Redis',
                    'description' => 'Low-latency async message broker processing 1M events/min.',
                ],
            ],
            'skill_groups' => [
                [
                    'name' => 'Cloud & Backend',
                    'skills' => ['Laravel', 'Go', 'PostgreSQL', 'Docker', 'Kubernetes'],
                ],
            ],
        ],
    ]);

    $this->coverLetter = CoverLetter::create([
        'user_id' => $this->user->id,
        'resume_id' => $this->resume->id,
        'title' => 'Staff Engineer Cover Letter',
        'language' => 'en',
        'tone' => 'professional',
        'job_description' => 'Looking for a Staff Engineer.',
        'content' => "Dear Hiring Manager,\n\nI am thrilled to apply for the Staff Engineer position. With extensive experience in cloud architecture and team leadership, I am confident in my ability to make an immediate impact.\n\nSincerely,\nAlice Johnson",
    ]);
});

test('unauthenticated users cannot access export endpoints', function () {
    $this->getJson('/api/exports')->assertStatus(401);
    $this->postJson("/api/exports/resumes/{$this->resume->id}")->assertStatus(401);
});

test('user can export a resume to pdf', function () {
    $response = $this->actingAs($this->user)->postJson("/api/exports/resumes/{$this->resume->id}", [
        'format' => 'pdf',
        'template' => 'modern-professional',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.format', 'pdf')
        ->assertJsonPath('data.template', 'modern-professional')
        ->assertJsonPath('data.status', 'completed')
        ->assertJsonStructure(['data' => ['id', 'file_name', 'file_size', 'download_url']]);

    $this->assertDatabaseHas('exports', [
        'user_id' => $this->user->id,
        'resume_id' => $this->resume->id,
        'format' => 'pdf',
    ]);
});

test('user can export a resume to docx', function () {
    $response = $this->actingAs($this->user)->postJson("/api/exports/resumes/{$this->resume->id}", [
        'format' => 'docx',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.format', 'docx')
        ->assertJsonPath('data.status', 'completed');

    $this->assertDatabaseHas('exports', [
        'user_id' => $this->user->id,
        'resume_id' => $this->resume->id,
        'format' => 'docx',
    ]);
});

test('user can export a cover letter to pdf and docx', function () {
    $pdfRes = $this->actingAs($this->user)->postJson("/api/exports/cover-letters/{$this->coverLetter->id}", [
        'format' => 'pdf',
    ]);
    $pdfRes->assertStatus(201)->assertJsonPath('data.format', 'pdf');

    $docxRes = $this->actingAs($this->user)->postJson("/api/exports/cover-letters/{$this->coverLetter->id}", [
        'format' => 'docx',
    ]);
    $docxRes->assertStatus(201)->assertJsonPath('data.format', 'docx');
});

test('user can download their exported document', function () {
    $createRes = $this->actingAs($this->user)->postJson("/api/exports/resumes/{$this->resume->id}", [
        'format' => 'pdf',
    ]);

    $exportId = $createRes->json('data.id');

    $downloadRes = $this->actingAs($this->user)->get("/api/exports/{$exportId}/download");
    $downloadRes->assertStatus(200)
        ->assertHeader('Content-Type', 'application/pdf');
});

test('user cannot download or delete another users export', function () {
    $otherUser = User::factory()->create();

    $createRes = $this->actingAs($this->user)->postJson("/api/exports/resumes/{$this->resume->id}", [
        'format' => 'pdf',
    ]);

    $exportId = $createRes->json('data.id');

    $this->actingAs($otherUser)->get("/api/exports/{$exportId}/download")
        ->assertStatus(403);

    $this->actingAs($otherUser)->deleteJson("/api/exports/{$exportId}")
        ->assertStatus(403);
});

test('user can list and delete their export history', function () {
    $this->actingAs($this->user)->postJson("/api/exports/resumes/{$this->resume->id}", ['format' => 'pdf']);

    $listRes = $this->actingAs($this->user)->getJson('/api/exports');
    $listRes->assertStatus(200)->assertJsonCount(1, 'data');

    $exportId = $listRes->json('data.0.id');
    $deleteRes = $this->actingAs($this->user)->deleteJson("/api/exports/{$exportId}");
    $deleteRes->assertStatus(200);

    $this->assertDatabaseMissing('exports', ['id' => $exportId]);
});
