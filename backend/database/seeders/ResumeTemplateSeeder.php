<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ResumeTemplate;
use Illuminate\Database\Seeder;

class ResumeTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'slug' => 'modern-professional',
                'name' => 'Modern Professional',
                'category' => 'professional',
                'thumbnail' => '/templates/modern-professional.png',
                'description' => 'Clean, balanced layout with vibrant accents ideal for corporate and tech roles.',
                'is_active' => true,
                'is_premium' => false,
                'usage_count' => 142,
            ],
            [
                'slug' => 'executive-bold',
                'name' => 'Executive Bold',
                'category' => 'executive',
                'thumbnail' => '/templates/executive-bold.png',
                'description' => 'Strong typography and authoritative header hierarchy for leadership positions.',
                'is_active' => true,
                'is_premium' => true,
                'usage_count' => 88,
            ],
            [
                'slug' => 'clean-minimal',
                'name' => 'Clean Minimal',
                'category' => 'minimal',
                'thumbnail' => '/templates/clean-minimal.png',
                'description' => 'Ultra-streamlined, ATS-optimized layout with maximal white space.',
                'is_active' => true,
                'is_premium' => false,
                'usage_count' => 210,
            ],
            [
                'slug' => 'technical-developer',
                'name' => 'Technical Developer',
                'category' => 'technical',
                'thumbnail' => '/templates/technical-developer.png',
                'description' => 'Tailored for software engineers, DevOps, and data science professionals.',
                'is_active' => true,
                'is_premium' => false,
                'usage_count' => 195,
            ],
            [
                'slug' => 'creative-designer',
                'name' => 'Creative Designer',
                'category' => 'creative',
                'thumbnail' => '/templates/creative-designer.png',
                'description' => 'Visually engaging layout with subtle violet tones for UI/UX and creative roles.',
                'is_active' => true,
                'is_premium' => true,
                'usage_count' => 64,
            ],
            [
                'slug' => 'academic-cv',
                'name' => 'Academic CV',
                'category' => 'academic',
                'thumbnail' => '/templates/academic-cv.png',
                'description' => 'Multi-page structured format tailored for research, academia, and medical CVs.',
                'is_active' => true,
                'is_premium' => false,
                'usage_count' => 37,
            ],
        ];

        foreach ($templates as $t) {
            ResumeTemplate::updateOrCreate(['slug' => $t['slug']], $t);
        }
    }
}
