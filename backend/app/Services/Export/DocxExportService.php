<?php

declare(strict_types=1);

namespace App\Services\Export;

use App\Models\CoverLetter;
use App\Models\Resume;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\SimpleType\Jc;

class DocxExportService
{
    /**
     * Generate Word document for a resume and save to a temporary path.
     */
    public function generateResumeDocx(Resume $resume): string
    {
        $phpWord = new PhpWord();
        $phpWord->setDefaultFontName('Calibri');
        $phpWord->setDefaultFontSize(10.5);

        $section = $phpWord->addSection([
            'marginTop' => 720,
            'marginBottom' => 720,
            'marginLeft' => 720,
            'marginRight' => 720,
        ]);

        $content = is_array($resume->content) ? $resume->content : (json_decode($resume->content ?? '[]', true) ?: []);
        $basics = $content['basics'] ?? [];
        $experiences = $content['experiences'] ?? [];
        $education = $content['education'] ?? [];
        $projects = $content['projects'] ?? [];
        $skillGroups = $content['skill_groups'] ?? [];

        // Header: Name & Title
        $fullName = $basics['full_name'] ?? $resume->title;
        $section->addText($fullName, ['bold' => true, 'size' => 20, 'color' => '2563EB']);

        if (!empty($basics['headline'])) {
            $section->addText($basics['headline'], ['size' => 11, 'color' => '64748B', 'italic' => true]);
        }

        // Contact info
        $contacts = array_filter([
            $basics['email'] ?? null,
            $basics['phone'] ?? null,
            $basics['location'] ?? null,
            $basics['website'] ?? null,
        ]);
        if (!empty($contacts)) {
            $section->addText(implode('  |  ', $contacts), ['size' => 9, 'color' => '475569']);
        }

        $section->addTextBreak(1);

        // Summary
        if (!empty($basics['summary'])) {
            $this->addSectionTitle($section, 'PROFESSIONAL SUMMARY');
            $section->addText($basics['summary'], ['size' => 10], ['alignment' => Jc::BOTH]);
            $section->addTextBreak(1);
        }

        // Experience
        if (!empty($experiences)) {
            $this->addSectionTitle($section, 'WORK EXPERIENCE');
            foreach ($experiences as $exp) {
                $role = $exp['role'] ?? $exp['title'] ?? 'Role';
                $company = $exp['company'] ?? 'Company';
                $period = $exp['period'] ?? (($exp['start_date'] ?? '') . ' - ' . ($exp['end_date'] ?? 'Present'));

                $table = $section->addTable(['width' => 100 * 50, 'unit' => 'pct']);
                $table->addRow();
                $table->addCell(7000)->addText("{$role} — {$company}", ['bold' => true, 'size' => 10.5]);
                $table->addCell(3000)->addText($period, ['italic' => true, 'size' => 9.5, 'color' => '64748B'], ['alignment' => Jc::END]);

                $bullets = $exp['bullets'] ?? $exp['highlights'] ?? [];
                if (is_array($bullets)) {
                    foreach ($bullets as $bullet) {
                        $section->addListItem((string) $bullet, 0, ['size' => 10]);
                    }
                }
                $section->addTextBreak(1);
            }
        }

        // Education
        if (!empty($education)) {
            $this->addSectionTitle($section, 'EDUCATION');
            foreach ($education as $edu) {
                $degree = $edu['degree'] ?? 'Degree';
                $school = $edu['institution'] ?? $edu['school'] ?? 'School';
                $year = $edu['year'] ?? ($edu['graduation_date'] ?? '');

                $table = $section->addTable(['width' => 100 * 50, 'unit' => 'pct']);
                $table->addRow();
                $table->addCell(7000)->addText("{$degree}, {$school}", ['bold' => true, 'size' => 10]);
                $table->addCell(3000)->addText($year, ['italic' => true, 'size' => 9.5, 'color' => '64748B'], ['alignment' => Jc::END]);
            }
            $section->addTextBreak(1);
        }

        // Projects
        if (!empty($projects)) {
            $this->addSectionTitle($section, 'PROJECTS');
            foreach ($projects as $proj) {
                $name = $proj['name'] ?? $proj['title'] ?? 'Project';
                $tech = $proj['technologies'] ?? $proj['tech_stack'] ?? '';
                $desc = $proj['description'] ?? '';

                $section->addText($name . (!empty($tech) ? " ({$tech})" : ''), ['bold' => true, 'size' => 10]);
                if (!empty($desc)) {
                    $section->addText($desc, ['size' => 9.5]);
                }
            }
            $section->addTextBreak(1);
        }

        // Skills
        if (!empty($skillGroups)) {
            $this->addSectionTitle($section, 'SKILLS');
            foreach ($skillGroups as $group) {
                $label = $group['name'] ?? $group['category'] ?? 'Skills';
                $skillsList = is_array($group['skills'] ?? null)
                    ? implode(', ', $group['skills'])
                    : (string) ($group['skills'] ?? '');

                $textRun = $section->addTextRun();
                $textRun->addText("{$label}: ", ['bold' => true, 'size' => 10]);
                $textRun->addText($skillsList, ['size' => 10]);
            }
        }

        $tempFile = tempnam(sys_get_temp_dir(), 'resume_') . '.docx';
        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tempFile);

        return $tempFile;
    }

    /**
     * Generate Word document for a cover letter.
     */
    public function generateCoverLetterDocx(CoverLetter $coverLetter): string
    {
        $phpWord = new PhpWord();
        $phpWord->setDefaultFontName('Calibri');
        $phpWord->setDefaultFontSize(11);

        $section = $phpWord->addSection([
            'marginTop' => 1440,
            'marginBottom' => 1440,
            'marginLeft' => 1440,
            'marginRight' => 1440,
        ]);

        $userName = $coverLetter->user->name ?? 'Candidate';
        $userEmail = $coverLetter->user->email ?? '';

        $section->addText($userName, ['bold' => true, 'size' => 18, 'color' => '2563EB']);
        $section->addText($userEmail, ['size' => 10, 'color' => '64748B']);
        $section->addTextBreak(1);

        $section->addText($coverLetter->created_at->format('F d, Y'), ['size' => 10, 'color' => '475569']);
        $section->addTextBreak(1);

        $paragraphs = explode("\n", $coverLetter->content);
        foreach ($paragraphs as $p) {
            $pTrim = trim($p);
            if (!empty($pTrim)) {
                $section->addText($pTrim, ['size' => 11], ['alignment' => Jc::BOTH]);
            } else {
                $section->addTextBreak(1);
            }
        }

        $tempFile = tempnam(sys_get_temp_dir(), 'cl_') . '.docx';
        $writer = IOFactory::createWriter($phpWord, 'Word2007');
        $writer->save($tempFile);

        return $tempFile;
    }

    private function addSectionTitle($section, string $title): void
    {
        $section->addText($title, ['bold' => true, 'size' => 11, 'color' => '2563EB']);
    }
}
