<?php

declare(strict_types=1);

use App\Jobs\ProcessResumeImportJob;
use App\Models\Resume;
use App\Models\ResumeImport;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;

test('unauthenticated users cannot access import endpoints', function () {
    $this->postJson('/api/resumes/import')->assertStatus(401);
    $this->getJson('/api/resumes/import/1')->assertStatus(401);
    $this->postJson('/api/resumes/import/1/confirm', [])->assertStatus(401);
    $this->deleteJson('/api/resumes/import/1')->assertStatus(401);
});

test('user can upload a valid PDF and dispatch processing job', function () {
    Storage::fake('local');
    Queue::fake();

    $user = User::factory()->create();
    $file = UploadedFile::fake()->createWithContent('sample_resume.pdf', "%PDF-1.4 sample resume pdf content\n%%EOF");

    $response = $this->actingAs($user)->postJson('/api/resumes/import', [
        'file' => $file,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.status', ResumeImport::STATUS_PENDING)
        ->assertJsonPath('data.original_filename', 'sample_resume.pdf');

    $importId = (int) $response->json('data.id');

    $this->assertDatabaseHas('resume_imports', [
        'id' => $importId,
        'user_id' => $user->id,
        'status' => ResumeImport::STATUS_PENDING,
        'original_filename' => 'sample_resume.pdf',
    ]);

    Queue::assertPushed(ProcessResumeImportJob::class, function ($job) use ($importId) {
        return $job->import->id === $importId;
    });
});

test('upload validation rejects non-pdf/docx and oversized files', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    // Invalid extension
    $badFile = UploadedFile::fake()->create('script.exe', 100, 'application/x-msdownload');
    $this->actingAs($user)->postJson('/api/resumes/import', [
        'file' => $badFile,
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['file']);

    // Exceeds 5MB limit
    $oversizedFile = UploadedFile::fake()->createWithContent('large.pdf', str_repeat('A', 6 * 1024 * 1024));
    $this->actingAs($user)->postJson('/api/resumes/import', [
        'file' => $oversizedFile,
    ])->assertStatus(422)
      ->assertJsonValidationErrors(['file']);
});

test('user can check their own import status', function () {
    $user = User::factory()->create();
    $import = ResumeImport::create([
        'user_id' => $user->id,
        'original_filename' => 'my_resume.pdf',
        'file_path' => 'resume_imports/test.pdf',
        'file_type' => 'pdf',
        'file_size' => 1024,
        'status' => ResumeImport::STATUS_READY,
        'parsed_content' => [
            'basics' => [
                'full_name' => 'Alice Smith',
                'email' => 'alice@example.com',
            ],
            'experiences' => [],
            'education' => [],
            'projects' => [],
            'skill_groups' => [],
        ],
        'expires_at' => now()->addHours(24),
    ]);

    $response = $this->actingAs($user)->getJson("/api/resumes/import/{$import->id}");

    $response->assertStatus(200)
        ->assertJsonPath('data.status', ResumeImport::STATUS_READY)
        ->assertJsonPath('data.parsed_content.basics.full_name', 'Alice Smith');
});

test('user cannot view another users import', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $import = ResumeImport::create([
        'user_id' => $otherUser->id,
        'original_filename' => 'other_resume.pdf',
        'file_path' => 'resume_imports/other.pdf',
        'file_type' => 'pdf',
        'file_size' => 1024,
        'status' => ResumeImport::STATUS_READY,
        'expires_at' => now()->addHours(24),
    ]);

    $this->actingAs($user)->getJson("/api/resumes/import/{$import->id}")
        ->assertStatus(403);
});

test('user can confirm a ready import and create a normal resume', function () {
    $user = User::factory()->create();
    $import = ResumeImport::create([
        'user_id' => $user->id,
        'original_filename' => 'alex_dev.pdf',
        'file_path' => 'resume_imports/alex.pdf',
        'file_type' => 'pdf',
        'file_size' => 2048,
        'status' => ResumeImport::STATUS_READY,
        'parsed_content' => [
            'basics' => [
                'full_name' => 'Alex Dev',
                'email' => 'alex@example.com',
            ],
        ],
        'expires_at' => now()->addHours(24),
    ]);

    $confirmationPayload = [
        'title' => 'Alex Dev - Senior Engineer',
        'template' => 'modern-professional',
        'language' => 'en',
        'basics' => [
            'full_name' => 'Alex Dev',
            'headline' => 'Senior Full Stack Engineer',
            'email' => 'alex@example.com',
            'phone' => '+1234567890',
            'location' => 'San Francisco, CA',
            'summary' => 'Experienced software engineer.',
        ],
        'experiences' => [
            [
                'id' => 'exp-1',
                'company' => 'Acme Corp',
                'position' => 'Lead Developer',
                'location' => 'San Francisco, CA',
                'start_date' => '2021-01',
                'end_date' => null,
                'is_current' => true,
                'highlights' => ['Built high throughput API', 'Mentored 4 juniors'],
            ],
        ],
        'education' => [
            [
                'id' => 'edu-1',
                'institution' => 'Tech University',
                'degree' => 'Bachelor of Science',
                'field_of_study' => 'Computer Science',
                'start_date' => '2015-09',
                'end_date' => '2019-05',
            ],
        ],
        'skill_groups' => [
            [
                'id' => 'skill-1',
                'name' => 'Languages',
                'skills' => ['PHP', 'TypeScript', 'Python'],
            ],
        ],
        'projects' => [
            [
                'id' => 'proj-1',
                'title' => 'ResumeNova',
                'role' => 'Creator',
                'url' => 'https://example.com',
                'highlights' => ['Modern ATS builder'],
            ],
        ],
    ];

    $response = $this->actingAs($user)->postJson("/api/resumes/import/{$import->id}/confirm", $confirmationPayload);

    $response->assertStatus(201)
        ->assertJsonPath('data.title', 'Alex Dev - Senior Engineer')
        ->assertJsonPath('data.basics.full_name', 'Alex Dev')
        ->assertJsonPath('data.experiences.0.company', 'Acme Corp');

    $resumeId = $response->json('data.id');

    // Verify import is updated
    $import->refresh();
    expect($import->status)->toBe(ResumeImport::STATUS_COMPLETED);
    expect((string) $import->created_resume_id)->toBe((string) $resumeId);

    // Verify normal resume exists in resumes table
    $this->assertDatabaseHas('resumes', [
        'id' => $resumeId,
        'user_id' => $user->id,
        'title' => 'Alex Dev - Senior Engineer',
    ]);
});

test('confirmation is idempotent and returns existing resume without duplication', function () {
    $user = User::factory()->create();
    $existingResume = Resume::factory()->create([
        'user_id' => $user->id,
        'title' => 'Existing Resume',
    ]);

    $import = ResumeImport::create([
        'user_id' => $user->id,
        'original_filename' => 'alex_dev.pdf',
        'file_path' => 'resume_imports/alex.pdf',
        'file_type' => 'pdf',
        'file_size' => 2048,
        'status' => ResumeImport::STATUS_COMPLETED,
        'created_resume_id' => $existingResume->id,
        'expires_at' => now()->addHours(24),
    ]);

    $confirmationPayload = [
        'title' => 'Duplicate Attempt',
        'basics' => [
            'full_name' => 'Alex Dev',
        ],
    ];

    $response = $this->actingAs($user)->postJson("/api/resumes/import/{$import->id}/confirm", $confirmationPayload);

    $response->assertStatus(200)
        ->assertJsonPath('data.id', (string) $existingResume->id);

    // No extra resumes created
    $this->assertDatabaseCount('resumes', 1);
});

test('user can cancel an import and temporary file is removed', function () {
    Storage::fake('local');
    $filePath = 'resume_imports/temp_to_cancel.pdf';
    Storage::disk('local')->put($filePath, 'dummy content');

    $user = User::factory()->create();
    $import = ResumeImport::create([
        'user_id' => $user->id,
        'original_filename' => 'temp.pdf',
        'file_path' => $filePath,
        'file_type' => 'pdf',
        'file_size' => 100,
        'status' => ResumeImport::STATUS_PENDING,
        'expires_at' => now()->addHours(24),
    ]);

    $response = $this->actingAs($user)->deleteJson("/api/resumes/import/{$import->id}");

    $response->assertStatus(200)
        ->assertJson(['message' => 'Resume import cancelled and discarded successfully.']);

    $this->assertDatabaseMissing('resume_imports', ['id' => $import->id]);
    Storage::disk('local')->assertMissing($filePath);
});

test('cleanup command removes expired imports and files without deleting resumes', function () {
    Storage::fake('local');

    $user = User::factory()->create();

    // 1. Confirmed resume (should NEVER be deleted)
    $permanentResume = Resume::factory()->create([
        'user_id' => $user->id,
        'title' => 'Permanent Resume',
    ]);

    // 2. Expired import with file
    $expiredFile = 'resume_imports/expired.pdf';
    Storage::disk('local')->put($expiredFile, 'expired content');
    $expiredImport = ResumeImport::create([
        'user_id' => $user->id,
        'original_filename' => 'expired.pdf',
        'file_path' => $expiredFile,
        'file_type' => 'pdf',
        'file_size' => 100,
        'status' => ResumeImport::STATUS_READY,
        'expires_at' => now()->subHour(), // Expired!
    ]);

    // 3. Active import with file
    $activeFile = 'resume_imports/active.pdf';
    Storage::disk('local')->put($activeFile, 'active content');
    $activeImport = ResumeImport::create([
        'user_id' => $user->id,
        'original_filename' => 'active.pdf',
        'file_path' => $activeFile,
        'file_type' => 'pdf',
        'file_size' => 100,
        'status' => ResumeImport::STATUS_READY,
        'expires_at' => now()->addHours(12), // Active
    ]);

    // Run artisan cleanup command
    $this->artisan('resume-imports:cleanup')
        ->expectsOutputToContain('Successfully cleaned up 1 / 1 expired resume imports.')
        ->assertExitCode(0);

    // Verify expired import deleted and its file deleted
    $this->assertDatabaseMissing('resume_imports', ['id' => $expiredImport->id]);
    Storage::disk('local')->assertMissing($expiredFile);

    // Verify active import is retained
    $this->assertDatabaseHas('resume_imports', ['id' => $activeImport->id]);
    Storage::disk('local')->assertExists($activeFile);

    // Verify permanent resume is intact
    $this->assertDatabaseHas('resumes', ['id' => $permanentResume->id]);
});

test('ResumeFileExtractorService can extract text from PDF using Smalot Parser or stream fallback', function () {
    $service = new \App\Services\ResumeFileExtractorService();

    // Create a valid raw PDF structure with text stream
    $pdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT\n/F1 12 Tf\n72 712 Td\n(John Doe Senior Software Engineer Experience at Acme Corp Building High Scale Web Applications and Distributed Systems) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000210 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n380\n%%EOF";

    $tempFile = tempnam(sys_get_temp_dir(), 'test_resume_') . '.pdf';
    file_put_contents($tempFile, $pdfContent);

    try {
        $extracted = $service->extractText($tempFile, 'pdf');
        expect($extracted)->toBeString()
            ->and(strlen($extracted))->toBeGreaterThanOrEqual(50)
            ->and($extracted)->toContain('John Doe');
    } finally {
        @unlink($tempFile);
    }
});
