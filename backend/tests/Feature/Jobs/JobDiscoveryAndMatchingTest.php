<?php

declare(strict_types=1);

use App\Contracts\AIProviderInterface;
use App\DTOs\AIProviderResponse;
use App\Models\ApiKey;
use App\Models\JobApplication;
use App\Models\JobMatch;
use App\Models\JobPosting;
use App\Models\JobSource;
use App\Models\Resume;
use App\Models\SavedJob;
use App\Models\User;
use Illuminate\Support\Facades\Http;

test('unauthenticated users cannot access job discovery or matching endpoints', function () {
    $this->getJson('/api/jobs')->assertStatus(401);
    $this->postJson('/api/jobs/discover')->assertStatus(401);
    $this->postJson('/api/jobs/match')->assertStatus(401);
    $this->getJson('/api/job-matches')->assertStatus(401);
    $this->getJson('/api/saved-jobs')->assertStatus(401);
    $this->getJson('/api/job-applications')->assertStatus(401);
});

test('user can list and filter job postings', function () {
    $user = User::factory()->create();

    $job1 = JobPosting::create([
        'title' => 'Senior React Developer',
        'company' => 'Tech Corp',
        'location' => 'Remote',
        'work_mode' => 'remote',
        'employment_type' => 'full-time',
        'description' => 'Looking for React and TypeScript expert.',
        'skills_required' => ['React', 'TypeScript'],
        'normalization_hash' => sha1('tech corp senior react developer'),
        'posted_at' => now(),
        'is_active' => true,
    ]);

    $job2 = JobPosting::create([
        'title' => 'Python Data Engineer',
        'company' => 'DataLabs',
        'location' => 'New York, NY',
        'work_mode' => 'onsite',
        'employment_type' => 'contract',
        'description' => 'Looking for Python and SQL specialist.',
        'skills_required' => ['Python', 'SQL'],
        'normalization_hash' => sha1('datalabs python data engineer'),
        'posted_at' => now(),
        'is_active' => true,
    ]);

    // Search query
    $response = $this->actingAs($user)->getJson('/api/jobs?q=React');
    $response->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.title', 'Senior React Developer');

    // Filter by work_mode
    $responseMode = $this->actingAs($user)->getJson('/api/jobs?work_mode=remote');
    $responseMode->assertStatus(200)
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $job1->id);
});

test('user can trigger live job discovery from providers and deduplicate', function () {
    $user = User::factory()->create();

    // Mock Remotive API & RSS responses using wildcards
    Http::fake([
        '*remotive.com*' => Http::response([
            'jobs' => [
                [
                    'id' => 101,
                    'title' => 'Fullstack Laravel Engineer',
                    'company_name' => 'Acme Labs',
                    'url' => 'https://remotive.com/job/101',
                    'candidate_required_location' => 'Worldwide',
                    'job_type' => 'full_time',
                    'salary' => '$100k - $120k',
                    'description' => '<p>We need a Laravel & React developer with MySQL skills.</p>',
                    'tags' => ['Laravel', 'React', 'PHP'],
                    'publication_date' => now()->toIso8601String(),
                ],
            ],
        ], 200),
        '*weworkremotely.com*' => Http::response(
            '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><item><title>Acme Labs: Fullstack Laravel Engineer</title><link>https://weworkremotely.com/job/202</link><description>We need a Laravel &amp; React developer.</description><pubDate>' . now()->toRfc2822String() . '</pubDate></item></channel></rss>',
            200
        ),
    ]);

    $response = $this->actingAs($user)->postJson('/api/jobs/discover', [
        'q' => 'Laravel',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['message', 'new_jobs_count']);

    // Check that job was created in DB
    $this->assertDatabaseHas('job_postings', [
        'company' => 'Acme Labs',
        'title' => 'Fullstack Laravel Engineer',
    ]);

    // Check that job link was registered
    $this->assertDatabaseHas('job_links', [
        'url' => 'https://remotive.com/job/101',
    ]);
});

test('user can run AI smart match against resume using Groq', function () {
    $user = User::factory()->create();
    $resume = Resume::factory()->create([
        'user_id' => $user->id,
        'title' => 'Fullstack Developer Resume',
        'content' => [
            'basics' => ['full_name' => 'Alex Developer', 'headline' => 'Laravel & React Expert'],
            'skill_groups' => [
                ['skills' => ['Laravel', 'React', 'PHP', 'TypeScript']],
            ],
        ],
    ]);

    $job = JobPosting::create([
        'title' => 'Lead Fullstack Developer',
        'company' => 'NovaTech',
        'location' => 'Remote',
        'work_mode' => 'remote',
        'description' => 'Senior role requiring Laravel, React, and AWS cloud expertise.',
        'skills_required' => ['Laravel', 'React', 'AWS'],
        'normalization_hash' => sha1('novatech lead fullstack developer'),
        'posted_at' => now(),
        'is_active' => true,
    ]);

    ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Groq Key',
        'provider' => 'groq',
        'key' => 'gsk_testgroqkey',
        'masked_key' => 'gsk_••••key',
        'priority' => 1,
        'status' => 'active',
    ]);

    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('getProviderName')->andReturn('groq');
    $mockProvider->shouldReceive('generate')
        ->once()
        ->andReturn(new AIProviderResponse(
            content: '{"match_score": 88, "match_reasoning": "Strong match with core tech stack.", "matched_skills": ["Laravel", "React"], "missing_skills": ["AWS"], "recommendation": "Highlight AWS deployments in your summary."}',
            model: 'llama-3.3-70b-versatile',
            parsedJson: [
                'match_score' => 88,
                'match_reasoning' => 'Strong match with core tech stack.',
                'matched_skills' => ['Laravel', 'React'],
                'missing_skills' => ['AWS'],
                'recommendation' => 'Highlight AWS deployments in your summary.',
            ]
        ));

    app()->instance(AIProviderInterface::class, $mockProvider);

    $response = $this->actingAs($user)->postJson('/api/jobs/match', [
        'resume_id' => $resume->id,
        'job_posting_id' => $job->id,
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['message', 'matches'])
        ->assertJsonPath('matches.0.match_score', 88)
        ->assertJsonPath('matches.0.matched_skills', ['Laravel', 'React']);

    $this->assertDatabaseHas('job_matches', [
        'user_id' => $user->id,
        'job_posting_id' => $job->id,
        'match_score' => 88,
    ]);
});

test('user can dismiss an AI match', function () {
    $user = User::factory()->create();
    $job = JobPosting::create([
        'title' => 'DevOps Engineer',
        'company' => 'CloudCorp',
        'location' => 'Remote',
        'description' => 'DevOps role.',
        'normalization_hash' => sha1('cloudcorp devops engineer'),
        'is_active' => true,
    ]);

    $match = JobMatch::create([
        'user_id' => $user->id,
        'job_posting_id' => $job->id,
        'match_score' => 70,
        'match_reasoning' => 'Moderate fit',
        'matched_skills' => ['Linux'],
        'missing_skills' => ['Kubernetes'],
        'is_dismissed' => false,
    ]);

    $response = $this->actingAs($user)->postJson("/api/job-matches/{$match->id}/dismiss");
    $response->assertStatus(200);

    $this->assertDatabaseHas('job_matches', [
        'id' => $match->id,
        'is_dismissed' => true,
    ]);
});

test('user can bookmark and remove saved jobs', function () {
    $user = User::factory()->create();
    $job = JobPosting::create([
        'title' => 'Frontend Architect',
        'company' => 'DesignTech',
        'location' => 'Remote',
        'description' => 'Frontend role.',
        'normalization_hash' => sha1('designtech frontend architect'),
        'is_active' => true,
    ]);

    // Save job
    $saveResponse = $this->actingAs($user)->postJson('/api/saved-jobs', [
        'job_posting_id' => $job->id,
        'notes' => 'Great benefits package',
    ]);
    $saveResponse->assertStatus(201)
        ->assertJsonPath('job_posting_id', $job->id);

    $this->assertDatabaseHas('saved_jobs', [
        'user_id' => $user->id,
        'job_posting_id' => $job->id,
    ]);

    // List saved jobs
    $listResponse = $this->actingAs($user)->getJson('/api/saved-jobs');
    $listResponse->assertStatus(200)
        ->assertJsonCount(1);

    // Remove saved job
    $savedId = $saveResponse->json('id');
    $deleteResponse = $this->actingAs($user)->deleteJson("/api/saved-jobs/{$savedId}");
    $deleteResponse->assertStatus(204);

    $this->assertDatabaseMissing('saved_jobs', [
        'id' => $savedId,
    ]);
});

test('user can track and update job applications', function () {
    $user = User::factory()->create();
    $job = JobPosting::create([
        'title' => 'Backend Staff Engineer',
        'company' => 'HyperScale',
        'location' => 'Remote',
        'description' => 'Staff engineer role.',
        'normalization_hash' => sha1('hyperscale backend staff engineer'),
        'is_active' => true,
    ]);

    // Track application with resume_id and metadata
    $resume = Resume::factory()->create(['user_id' => $user->id]);

    $createResponse = $this->actingAs($user)->postJson('/api/job-applications', [
        'job_posting_id' => $job->id,
        'resume_id' => $resume->id,
        'status' => 'applied',
        'applied_at' => now()->toDateString(),
        'notes' => 'Applied via company portal',
        'metadata' => ['source' => 'linkedin', 'stage' => 'initial'],
    ]);

    $createResponse->assertStatus(201)
        ->assertJsonPath('status', 'applied')
        ->assertJsonPath('resume_id', $resume->id);

    $appId = $createResponse->json('id');

    // Update status to interviewing
    $updateResponse = $this->actingAs($user)->putJson("/api/job-applications/{$appId}", [
        'status' => 'interviewing',
        'notes' => 'Technical interview scheduled with VP of Eng',
    ]);

    $updateResponse->assertStatus(200)
        ->assertJsonPath('status', 'interviewing');

    $this->assertDatabaseHas('job_applications', [
        'id' => $appId,
        'resume_id' => $resume->id,
        'status' => 'interviewing',
        'notes' => 'Technical interview scheduled with VP of Eng',
    ]);
});

test('user can manage candidate skills and job preferences', function () {
    $user = User::factory()->create();

    // 1. Candidate Skills
    $skillResponse = $this->actingAs($user)->postJson('/api/candidate-skills', [
        'name' => 'Laravel',
        'proficiency_level' => 'expert',
        'years_experience' => 5.5,
        'is_verified' => true,
    ]);

    $skillResponse->assertStatus(201)
        ->assertJsonPath('name', 'Laravel')
        ->assertJsonPath('proficiency_level', 'expert');

    $this->assertDatabaseHas('candidate_skills', [
        'user_id' => $user->id,
        'name' => 'Laravel',
        'is_verified' => true,
    ]);

    // 2. Job Preferences
    $prefResponse = $this->actingAs($user)->postJson('/api/job-preferences', [
        'titles' => ['Senior Backend Engineer', 'Lead Architect'],
        'locations' => ['Remote', 'San Francisco, CA'],
        'location_types' => ['remote', 'hybrid'],
        'employment_types' => ['full-time'],
        'skills' => ['PHP', 'Laravel', 'React'],
        'min_salary' => 140000,
        'salary_currency' => 'USD',
        'is_active' => true,
    ]);

    $prefResponse->assertStatus(201)
        ->assertJsonPath('salary_currency', 'USD')
        ->assertJsonPath('min_salary', 140000);

    $this->assertDatabaseHas('job_preferences', [
        'user_id' => $user->id,
        'min_salary' => 140000,
        'salary_currency' => 'USD',
    ]);
});

test('privacy stripper removes emails, phone numbers, and URLs from resumes', function () {
    $rawText = "Contact John at john.doe@example.com or +1 (555) 123-4567. Portfolio at https://johndoe.dev/portfolio. Experienced PHP developer.";
    $stripped = \App\Services\AI\PrivacyStripper::strip($rawText);

    expect($stripped)->not->toContain('john.doe@example.com')
        ->not->toContain('123-4567')
        ->not->toContain('https://johndoe.dev')
        ->toContain('[EMAIL REMOVED]')
        ->toContain('[PHONE REMOVED]')
        ->toContain('[LINK REMOVED]')
        ->toContain('Experienced PHP developer');
});

test('high match evaluation creates notification and prevents duplicate notifications', function () {
    $user = User::factory()->create();
    $job = JobPosting::create([
        'title' => 'Principal Software Architect',
        'company' => 'Stellar Systems',
        'location' => 'Remote',
        'description' => 'Architect role.',
        'normalization_hash' => sha1('stellar systems principal software architect'),
        'is_active' => true,
    ]);

    ApiKey::create([
        'user_id' => $user->id,
        'name' => 'Groq Key',
        'provider' => 'groq',
        'key' => 'gsk_testgroqkey',
        'masked_key' => 'gsk_••••key',
        'priority' => 1,
        'status' => 'active',
    ]);

    $mockProvider = Mockery::mock(AIProviderInterface::class);
    $mockProvider->shouldReceive('getProviderName')->andReturn('groq');
    $mockProvider->shouldReceive('generate')
        ->twice()
        ->andReturn(new AIProviderResponse(
            content: '{"match_score": 95, "match_reasoning": "Flawless match.", "matched_skills": ["Architecture"], "missing_skills": []}',
            model: 'llama-3.3-70b-versatile',
            parsedJson: [
                'match_score' => 95,
                'match_reasoning' => 'Flawless match.',
                'matched_skills' => ['Architecture'],
                'missing_skills' => [],
            ]
        ));

    app()->instance(AIProviderInterface::class, $mockProvider);

    $service = app(\App\Services\AI\JobMatchingService::class);

    // First evaluation: should create 1 notification
    $match1 = $service->evaluateMatch($user, $job, "Senior Software Architect with 10 years experience.");
    expect($match1->match_score)->toBe(95);
    expect($user->notifications()->count())->toBe(1);

    // Second evaluation for the same job: should NOT create a duplicate notification
    $match2 = $service->evaluateMatch($user, $job, "Senior Software Architect with 10 years experience.");
    expect($match2->match_score)->toBe(95);
    expect($user->notifications()->count())->toBe(1);
});
