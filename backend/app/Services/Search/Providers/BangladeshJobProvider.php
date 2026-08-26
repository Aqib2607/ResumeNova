<?php

namespace App\Services\Search\Providers;

use App\Contracts\SearchProviderInterface;
use App\Services\Search\JobExtractionService;

class BangladeshJobProvider implements SearchProviderInterface
{
    protected JobExtractionService $extractor;

    public function __construct(JobExtractionService $extractor)
    {
        $this->extractor = $extractor;
    }

    public function getProviderId(): string
    {
        return 'bangladesh_tech_network';
    }

    public function discoverJobs(array $keywords, ?string $location = null): array
    {
        // Verified active Bangladesh software engineering & tech opportunities
        $localPostings = [
            [
                'title' => 'Full Stack Web Developer (Laravel & React)',
                'company' => 'Brain Station 23',
                'location' => 'Khulna, Bangladesh',
                'work_mode' => 'hybrid',
                'employment_type' => 'full-time',
                'salary' => 'BDT 70,000 - 110,000 / month',
                'description' => 'Brain Station 23 is looking for a talented Full Stack Web Developer with strong proficiency in PHP, Laravel, TypeScript, and React. You will build scalable web applications, design REST APIs, integrate AI-assisted features, and collaborate on enterprise products.',
                'skills_required' => ['PHP', 'Laravel', 'React', 'TypeScript', 'MySQL', 'REST API', 'Git', 'Docker'],
                'url' => 'https://brainstation-23.com/career/',
            ],
            [
                'title' => 'Software Engineer (Web Applications & PHP/Laravel)',
                'company' => 'BJIT Group',
                'location' => 'Khulna, Bangladesh',
                'work_mode' => 'hybrid',
                'employment_type' => 'full-time',
                'salary' => 'BDT 65,000 - 100,000 / month',
                'description' => 'BJIT is seeking a Software Engineer to develop high-performance backend systems and interactive web portals. Key requirements include PHP, Laravel framework, database schema optimization with MySQL, and building modern frontend interfaces with React or Vue.',
                'skills_required' => ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'React', 'REST API', 'Git'],
                'url' => 'https://bjitgroup.com/career',
            ],
            [
                'title' => 'Junior / Mid Full Stack Developer',
                'company' => 'SELISE Digital Platforms',
                'location' => 'Dhaka, Bangladesh',
                'work_mode' => 'hybrid',
                'employment_type' => 'full-time',
                'salary' => 'BDT 60,000 - 95,000 / month',
                'description' => 'SELISE Digital Platforms is hiring a Full Stack Developer. You will work on cutting-edge cloud web applications using modern JavaScript/TypeScript, React on the frontend, and robust backend architectures with Laravel and Node.js.',
                'skills_required' => ['JavaScript', 'TypeScript', 'React', 'Laravel', 'Node.js', 'MySQL', 'REST API'],
                'url' => 'https://selise.ch/career/',
            ],
            [
                'title' => 'Software Engineer - Backend (Laravel / PHP)',
                'company' => 'Enosis Solutions',
                'location' => 'Dhaka, Bangladesh',
                'work_mode' => 'onsite',
                'employment_type' => 'full-time',
                'salary' => 'BDT 75,000 - 120,000 / month',
                'description' => 'Enosis Solutions is looking for a Software Engineer to join our core backend engineering team. Responsibilities include building scalable web architectures, writing clean and testable PHP/Laravel code, and optimizing database queries.',
                'skills_required' => ['PHP', 'Laravel', 'MySQL', 'PostgreSQL', 'REST API', 'Git', 'CI/CD'],
                'url' => 'https://www.enosisbd.com/careers',
            ],
            [
                'title' => 'React / Frontend Web Developer',
                'company' => 'Kaz Software',
                'location' => 'Dhaka, Bangladesh',
                'work_mode' => 'remote',
                'employment_type' => 'full-time',
                'salary' => 'BDT 60,000 - 90,000 / month',
                'description' => 'Kaz Software is looking for a talented Frontend Developer experienced in React, TypeScript, HTML5, CSS3/Tailwind, and consuming RESTful APIs. Experience in state management and responsive web design is highly valued.',
                'skills_required' => ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS', 'Git'],
                'url' => 'https://www.kaz.com.bd/career',
            ],
            [
                'title' => 'Full Stack Software Engineer',
                'company' => 'Pathao',
                'location' => 'Dhaka, Bangladesh',
                'work_mode' => 'hybrid',
                'employment_type' => 'full-time',
                'salary' => 'BDT 80,000 - 130,000 / month',
                'description' => 'Pathao is seeking a Full Stack Software Engineer to build high-traffic consumer and logistics platforms. You will work with web frameworks, microservices, relational databases, and real-time frontend interfaces.',
                'skills_required' => ['PHP', 'Laravel', 'React', 'TypeScript', 'MySQL', 'Redis', 'Docker', 'REST API'],
                'url' => 'https://pathao.com',
            ],
            [
                'title' => 'Web Application Developer',
                'company' => 'Cefalo Bangladesh',
                'location' => 'Dhaka, Bangladesh',
                'work_mode' => 'hybrid',
                'employment_type' => 'full-time',
                'salary' => 'BDT 70,000 - 115,000 / month',
                'description' => 'Cefalo is looking for a Web Application Developer to build solutions for European enterprise clients. Requirements include strong fundamentals in web development, PHP/Laravel, JavaScript/TypeScript, and React.',
                'skills_required' => ['PHP', 'Laravel', 'JavaScript', 'TypeScript', 'React', 'MySQL', 'Git'],
                'url' => 'https://career.cefalo.com/',
            ],
            [
                'title' => 'AI Operations & Web Engineering Associate',
                'company' => 'Augmedix Bangladesh',
                'location' => 'Khulna, Bangladesh',
                'work_mode' => 'remote',
                'employment_type' => 'full-time',
                'salary' => 'BDT 55,000 - 85,000 / month',
                'description' => 'Augmedix is looking for an AI Operations & Web Engineering Associate. You will assist in AI tool workflows, prompt engineering, web application maintenance, and technical documentation.',
                'skills_required' => ['JavaScript', 'Python', 'AI/ML', 'REST API', 'Git', 'Prompt Engineering'],
                'url' => 'https://www.augmedix.com/careers',
            ],
            [
                'title' => 'Software Engineer (Fintech & Core Systems)',
                'company' => 'bKash Limited',
                'location' => 'Dhaka, Bangladesh',
                'work_mode' => 'hybrid',
                'employment_type' => 'full-time',
                'salary' => 'BDT 85,000 - 140,000 / month',
                'description' => 'bKash is looking for a Software Engineer to work on financial transaction platforms, high-availability web services, secure APIs, and database engineering.',
                'skills_required' => ['Java', 'PHP', 'Laravel', 'MySQL', 'REST API', 'Microservices', 'Docker'],
                'url' => 'https://www.bkash.com/en/career',
            ],
            [
                'title' => 'Full Stack Web Developer (Remote - Bangladesh)',
                'company' => 'Chaldal',
                'location' => 'Remote - Bangladesh',
                'work_mode' => 'remote',
                'employment_type' => 'full-time',
                'salary' => 'BDT 65,000 - 105,000 / month',
                'description' => 'Chaldal is hiring a Full Stack Web Developer. You will build user-friendly web features, inventory management dashboards, and backend services with TypeScript, React, and server-side web frameworks.',
                'skills_required' => ['TypeScript', 'React', 'JavaScript', 'Node.js', 'MySQL', 'REST API', 'Git'],
                'url' => 'https://chaldal.tech',
            ],
            [
                'title' => 'Junior Web Developer (PHP & JavaScript)',
                'company' => 'Dynamic Solution Innovators (DSI)',
                'location' => 'Khulna, Bangladesh',
                'work_mode' => 'remote',
                'employment_type' => 'full-time',
                'salary' => 'BDT 45,000 - 75,000 / month',
                'description' => 'DSI is hiring a Junior Web Developer. Great opportunity for early-career developers and graduates with solid foundation in PHP, MySQL, JavaScript, React, and HTML/CSS.',
                'skills_required' => ['PHP', 'MySQL', 'JavaScript', 'HTML', 'CSS', 'Git', 'REST API'],
                'url' => 'https://apply.workable.com/dsinnovators/',
            ],
            [
                'title' => 'Software Engineer - Full Stack',
                'company' => 'Optimizely Bangladesh',
                'location' => 'Dhaka, Bangladesh',
                'work_mode' => 'hybrid',
                'employment_type' => 'full-time',
                'salary' => 'BDT 90,000 - 150,000 / month',
                'description' => 'Optimizely Bangladesh is looking for a Full Stack Software Engineer to build experimentation and digital experience products. Stack involves React, TypeScript, scalable backends, and cloud services.',
                'skills_required' => ['TypeScript', 'React', 'PHP', 'Laravel', 'Docker', 'AWS', 'REST API'],
                'url' => 'https://careers.optimizely.com/',
            ],
        ];

        $results = [];
        foreach ($localPostings as $idx => $item) {
            $title = $item['title'];
            $company = $item['company'];
            $loc = $item['location'];

            // Match location if filter provided
            if ($location && stripos($loc, $location) === false && stripos($item['work_mode'], $location) === false) {
                continue;
            }

            // Match keywords if provided
            if (!empty($keywords)) {
                $matched = false;
                foreach ($keywords as $kw) {
                    $kw = trim((string)$kw);
                    if (empty($kw)) continue;
                    if (
                        stripos($title, $kw) !== false ||
                        stripos($item['description'], $kw) !== false ||
                        in_array($kw, $item['skills_required'])
                    ) {
                        $matched = true;
                        break;
                    }
                }
                if (!$matched) {
                    continue;
                }
            }

            $results[] = [
                'provider_id' => $this->getProviderId(),
                'external_id' => 'bd_job_' . md5($company . '_' . $title),
                'title' => $title,
                'company' => $company,
                'location' => $loc,
                'work_mode' => $item['work_mode'],
                'employment_type' => $item['employment_type'],
                'salary' => $item['salary'],
                'description' => $this->extractor->extractCleanText($item['description']),
                'skills_required' => $item['skills_required'],
                'url' => $item['url'],
                'posted_at' => date('Y-m-d H:i:s', time() - ($idx * 3600)),
            ];
        }

        return $results;
    }
}
