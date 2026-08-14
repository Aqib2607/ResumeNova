<?php

declare(strict_types=1);

namespace App\Services\Export;

use App\Models\CoverLetter;
use App\Models\Resume;

class TemplateRenderingService
{
    /**
     * Render resume into self-contained HTML for PDF rendering.
     */
    public function renderResume(Resume $resume, string $template = 'modern-professional'): string
    {
        $content = is_array($resume->content) ? $resume->content : (json_decode($resume->content ?? '[]', true) ?: []);
        $basics = $content['basics'] ?? [];
        $experiences = $content['experiences'] ?? [];
        $education = $content['education'] ?? [];
        $projects = $content['projects'] ?? [];
        $skillGroups = $content['skill_groups'] ?? [];

        $fullName = htmlspecialchars($basics['full_name'] ?? $resume->title);
        $headline = htmlspecialchars($basics['headline'] ?? '');
        $email = htmlspecialchars($basics['email'] ?? '');
        $phone = htmlspecialchars($basics['phone'] ?? '');
        $location = htmlspecialchars($basics['location'] ?? '');
        $website = htmlspecialchars($basics['website'] ?? '');
        $summary = htmlspecialchars($basics['summary'] ?? '');

        // Styling tokens based on template
        $primaryColor = match ($template) {
            'executive-bold' => '#1e293b',
            'clean-minimal' => '#334155',
            'technical-developer' => '#0f766e',
            'creative-designer' => '#7c3aed',
            'academic-cv' => '#1e3a8a',
            default => '#2563eb', // modern-professional
        };

        $fontFamily = "'Inter', 'Segoe UI', 'DejaVu Sans', 'Noto Sans Bengali', sans-serif";

        $html = <<<HTML
<!DOCTYPE html>
<html lang="{$resume->language}">
<head>
<meta charset="utf-8">
<title>{$fullName} - Resume</title>
<style>
  @page { margin: 12mm 15mm; size: A4 portrait; }
  body {
    font-family: {$fontFamily};
    color: #1e293b;
    line-height: 1.45;
    font-size: 10pt;
    margin: 0;
    padding: 0;
  }
  h1 { font-size: 20pt; font-weight: 700; color: {$primaryColor}; margin: 0 0 2px 0; text-transform: uppercase; }
  .headline { font-size: 11pt; color: #64748b; font-weight: 600; margin-bottom: 6px; }
  .contact-bar { font-size: 8.5pt; color: #475569; margin-bottom: 14px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 8px; }
  .contact-bar span { margin-right: 12px; }
  .section-title {
    font-size: 11pt;
    font-weight: 700;
    color: {$primaryColor};
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid {$primaryColor};
    padding-bottom: 3px;
    margin: 12px 0 8px 0;
  }
  .summary { font-size: 9.5pt; color: #334155; margin-bottom: 10px; text-align: justify; }
  .entry { margin-bottom: 9px; }
  .entry-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 9.5pt; color: #0f172a; }
  .entry-sub { font-size: 8.5pt; color: #64748b; font-style: italic; margin-bottom: 3px; }
  .entry-bullets { margin: 3px 0 0 0; padding-left: 18px; font-size: 9pt; color: #334155; }
  .entry-bullets li { margin-bottom: 2px; }
  .skills-container { margin-bottom: 8px; font-size: 9pt; }
  .skill-row { margin-bottom: 3px; }
  .skill-label { font-weight: 700; color: #1e293b; }
</style>
</head>
<body>

  <!-- HEADER -->
  <div>
    <h1>{$fullName}</h1>
    {$this->renderHeadline($headline)}
    <div class="contact-bar">
      {$this->renderContactItem($email)}
      {$this->renderContactItem($phone)}
      {$this->renderContactItem($location)}
      {$this->renderContactItem($website)}
    </div>
  </div>

  <!-- SUMMARY -->
  {$this->renderSummarySection($summary)}

  <!-- EXPERIENCE -->
  {$this->renderExperienceSection($experiences)}

  <!-- EDUCATION -->
  {$this->renderEducationSection($education)}

  <!-- PROJECTS -->
  {$this->renderProjectsSection($projects)}

  <!-- SKILLS -->
  {$this->renderSkillsSection($skillGroups)}

</body>
</html>
HTML;

        return $html;
    }

    /**
     * Render cover letter into HTML for PDF.
     */
    public function renderCoverLetter(CoverLetter $coverLetter): string
    {
        $fontFamily = "'Inter', 'Segoe UI', 'DejaVu Sans', 'Noto Sans Bengali', sans-serif";
        $userName = htmlspecialchars($coverLetter->user->name ?? 'Job Applicant');
        $userEmail = htmlspecialchars($coverLetter->user->email ?? '');
        $date = $coverLetter->created_at->format('F d, Y');
        $contentHtml = nl2br(htmlspecialchars($coverLetter->content));

        return <<<HTML
<!DOCTYPE html>
<html lang="{$coverLetter->language}">
<head>
<meta charset="utf-8">
<title>Cover Letter</title>
<style>
  @page { margin: 20mm 20mm; size: A4 portrait; }
  body {
    font-family: {$fontFamily};
    color: #1e293b;
    line-height: 1.6;
    font-size: 11pt;
    margin: 0;
  }
  .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
  .name { font-size: 18pt; font-weight: 700; color: #2563eb; margin: 0; }
  .contact { font-size: 9.5pt; color: #64748b; margin-top: 4px; }
  .date { font-size: 10pt; color: #475569; margin-bottom: 20px; }
  .body { font-size: 10.5pt; color: #334155; text-align: justify; }
</style>
</head>
<body>
  <div class="header">
    <div class="name">{$userName}</div>
    <div class="contact">{$userEmail}</div>
  </div>

  <div class="date">{$date}</div>

  <div class="body">
    {$contentHtml}
  </div>
</body>
</html>
HTML;
    }

    private function renderHeadline(string $headline): string
    {
        return !empty($headline) ? "<div class=\"headline\">{$headline}</div>" : '';
    }

    private function renderContactItem(string $val): string
    {
        return !empty($val) ? "<span>{$val}</span>" : '';
    }

    private function renderSummarySection(string $summary): string
    {
        if (empty($summary)) return '';
        return "<div class=\"section-title\">Professional Summary</div><div class=\"summary\">{$summary}</div>";
    }

    private function renderExperienceSection(array $experiences): string
    {
        if (empty($experiences)) return '';
        $out = '<div class="section-title">Work Experience</div>';
        foreach ($experiences as $exp) {
            $role = htmlspecialchars($exp['role'] ?? $exp['title'] ?? '');
            $company = htmlspecialchars($exp['company'] ?? '');
            $location = htmlspecialchars($exp['location'] ?? '');
            $period = htmlspecialchars($exp['period'] ?? ($exp['start_date'] ?? '') . ' - ' . ($exp['end_date'] ?? 'Present'));
            $bullets = $exp['bullets'] ?? $exp['highlights'] ?? [];

            $out .= "<div class=\"entry\">";
            $out .= "<div class=\"entry-header\"><span>{$role} — {$company}</span><span>{$period}</span></div>";
            if (!empty($location)) {
                $out .= "<div class=\"entry-sub\">{$location}</div>";
            }
            if (!empty($bullets) && is_array($bullets)) {
                $out .= '<ul class="entry-bullets">';
                foreach ($bullets as $b) {
                    $bSafe = htmlspecialchars((string) $b);
                    $out .= "<li>{$bSafe}</li>";
                }
                $out .= '</ul>';
            }
            $out .= "</div>";
        }
        return $out;
    }

    private function renderEducationSection(array $education): string
    {
        if (empty($education)) return '';
        $out = '<div class="section-title">Education</div>';
        foreach ($education as $edu) {
            $degree = htmlspecialchars($edu['degree'] ?? '');
            $institution = htmlspecialchars($edu['institution'] ?? $edu['school'] ?? '');
            $year = htmlspecialchars($edu['year'] ?? ($edu['graduation_date'] ?? ''));

            $out .= "<div class=\"entry\">";
            $out .= "<div class=\"entry-header\"><span>{$degree}</span><span>{$year}</span></div>";
            $out .= "<div class=\"entry-sub\">{$institution}</div>";
            $out .= "</div>";
        }
        return $out;
    }

    private function renderProjectsSection(array $projects): string
    {
        if (empty($projects)) return '';
        $out = '<div class="section-title">Key Projects</div>';
        foreach ($projects as $proj) {
            $name = htmlspecialchars($proj['name'] ?? $proj['title'] ?? '');
            $tech = htmlspecialchars($proj['technologies'] ?? $proj['tech_stack'] ?? '');
            $desc = htmlspecialchars($proj['description'] ?? '');

            $out .= "<div class=\"entry\">";
            $out .= "<div class=\"entry-header\"><span>{$name}</span><span>{$tech}</span></div>";
            if (!empty($desc)) {
                $out .= "<div class=\"summary\" style=\"margin-top:2px;\">{$desc}</div>";
            }
            $out .= "</div>";
        }
        return $out;
    }

    private function renderSkillsSection(array $skillGroups): string
    {
        if (empty($skillGroups)) return '';
        $out = '<div class="section-title">Skills & Technologies</div><div class="skills-container">';
        foreach ($skillGroups as $group) {
            $label = htmlspecialchars($group['name'] ?? $group['category'] ?? 'Skills');
            $skillsList = is_array($group['skills'] ?? null)
                ? implode(', ', array_map('htmlspecialchars', $group['skills']))
                : htmlspecialchars((string) ($group['skills'] ?? ''));

            $out .= "<div class=\"skill-row\"><span class=\"skill-label\">{$label}:</span> {$skillsList}</div>";
        }
        $out .= '</div>';
        return $out;
    }
}
