<?php

declare(strict_types=1);

use App\Services\AI\ResumeParserService;
use App\Services\AI\AIEngineService;

test('ResumeParserService normalizes complex raw JSON structure into exact resume content schema', function () {
    // Mock AIEngineService
    $aiEngineMock = Mockery::mock(AIEngineService::class);
    $service = new ResumeParserService($aiEngineMock);

    $rawAiOutput = [
        'basics' => [
            'full_name' => 'Jane Developer',
            'headline' => 'Lead Software Architect',
            'email' => 'jane@example.com',
            'phone' => '+1 (555) 123-4567',
            'location' => 'Seattle, WA',
            'summary' => 'Passionate engineer with 10+ years experience building cloud systems.',
        ],
        'experiences' => [
            [
                'company' => 'Tech Corp',
                'title' => 'Principal Architect',
                'start_date' => '2020-01',
                'current' => true,
                'bullets' => ['Scaled distributed system to 10M DAU', 'Managed team of 15'],
            ],
            [
                'company_name' => 'Startup Inc',
                'position' => 'Senior Developer',
                'start_date' => '2016-03',
                'end_date' => '2019-12',
                'description' => "Built payment microservice\nOptimized MySQL queries",
            ]
        ],
        'education' => [
            [
                'institution' => 'University of Washington',
                'degree' => 'B.S.',
                'field_of_study' => 'Computer Science',
                'start_date' => '2012',
                'end_date' => '2016',
            ]
        ],
        'skills' => [
            'Programming Languages' => ['Go', 'TypeScript', 'PHP'],
            'Cloud & DevOps' => ['AWS', 'Docker', 'Kubernetes'],
        ],
        'projects' => [
            [
                'title' => 'OpenSource CLI',
                'description' => 'Fast developer toolkit',
                'tech' => ['Go', 'Cobra'],
            ]
        ]
    ];

    $normalized = $service->validateAndNormalizeSchema($rawAiOutput, 'Jane_Developer_Resume.pdf');

    // Verify title derived
    expect($normalized['title'])->toBe('Jane Developer - Lead Software Architect');

    // Verify basics
    expect($normalized['basics']['full_name'])->toBe('Jane Developer');
    expect($normalized['basics']['headline'])->toBe('Lead Software Architect');

    // Verify experiences have generated IDs and valid fields
    expect($normalized['experiences'])->toHaveCount(2);
    expect($normalized['experiences'][0]['id'])->toBe('exp-1');
    expect($normalized['experiences'][0]['company'])->toBe('Tech Corp');
    expect($normalized['experiences'][0]['role'])->toBe('Principal Architect');
    expect($normalized['experiences'][0]['current'])->toBeTrue();
    expect($normalized['experiences'][0]['bullets'])->toBe(['Scaled distributed system to 10M DAU', 'Managed team of 15']);
    
    expect($normalized['experiences'][1]['id'])->toBe('exp-2');
    expect($normalized['experiences'][1]['company'])->toBe('Startup Inc');
    expect($normalized['experiences'][1]['role'])->toBe('Senior Developer');
    expect($normalized['experiences'][1]['bullets'])->toBe(['Built payment microservice', 'Optimized MySQL queries']);

    // Verify education has generated IDs
    expect($normalized['education'])->toHaveCount(1);
    expect($normalized['education'][0]['id'])->toBe('edu-1');
    expect($normalized['education'][0]['school'])->toBe('University of Washington');
    expect($normalized['education'][0]['field'])->toBe('Computer Science');

    // Verify skill_groups converted properly from categorized map or arrays
    expect($normalized['skill_groups'])->toHaveCount(2);
    expect($normalized['skill_groups'][0]['id'])->toBe('skill-1');
    expect($normalized['skill_groups'][0]['category'])->toBe('Programming Languages');
    expect($normalized['skill_groups'][0]['skills'])->toBe(['Go', 'TypeScript', 'PHP']);

    // Verify projects
    expect($normalized['projects'])->toHaveCount(1);
    expect($normalized['projects'][0]['id'])->toBe('proj-1');
    expect($normalized['projects'][0]['name'])->toBe('OpenSource CLI');
    expect($normalized['projects'][0]['tech'])->toBe(['Go', 'Cobra']);
});
