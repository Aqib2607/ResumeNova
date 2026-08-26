<?php

namespace App\Services\Search;

class JobExtractionService
{
    /**
     * Cleans and sanitizes job descriptions.
     *
     * @param string|null $html
     * @return string
     */
    public function extractCleanText(?string $html): string
    {
        if (empty($html)) {
            return '';
        }

        // Replace `<br>` and block elements with spaces or newlines so text doesn't mash together
        $html = preg_replace('#(<br\s*/?>|<p>|<div>|<li>)#i', " \n ", $html);

        // Strip tags
        $text = strip_tags($html);

        // Decode HTML entities (e.g., &amp; -> &)
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // Remove excessive whitespace
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    /**
     * Extracts common technical skills found in text.
     *
     * @param string|null $text
     * @return array
     */
    public function extractSkillsFromText(?string $text): array
    {
        if (empty($text)) {
            return [];
        }

        $commonSkills = [
            'PHP', 'Laravel', 'JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js', 'Python', 'Django',
            'FastAPI', 'Go', 'Golang', 'Rust', 'Java', 'Spring Boot', 'C#', '.NET', 'AWS', 'Docker',
            'Kubernetes', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API', 'Git',
            'CI/CD', 'Tailwind CSS', 'Next.js', 'HTML', 'CSS', 'Microservices', 'Linux'
        ];

        $found = [];
        foreach ($commonSkills as $skill) {
            $pattern = '/\b' . preg_quote($skill, '/') . '\b/i';
            if (preg_match($pattern, $text)) {
                $found[] = $skill;
            }
        }

        return array_values(array_unique($found));
    }
}
