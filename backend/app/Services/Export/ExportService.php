<?php

declare(strict_types=1);

namespace App\Services\Export;

use App\Models\CoverLetter;
use App\Models\Export;
use App\Models\Resume;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ExportService
{
    public function __construct(
        protected TemplateRenderingService $templateRenderer,
        protected PdfExportService $pdfService,
        protected DocxExportService $docxService,
    ) {}

    /**
     * List paginated export history for user.
     */
    public function listUserExports(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return Export::where('user_id', $user->id)
            ->with(['resume:id,title', 'coverLetter:id,title'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Export resume to PDF or DOCX.
     */
    public function exportResume(
        User $user,
        Resume $resume,
        string $format = 'pdf',
        string $template = 'modern-professional',
    ): Export {
        $cleanTitle = Str::slug($resume->title ?: 'resume');
        $fileName = "{$cleanTitle}-" . date('Ymd_His') . ".{$format}";
        $storageDir = "exports/user_{$user->id}";
        $storagePath = "{$storageDir}/{$fileName}";

        if ($format === 'docx') {
            $tempFilePath = $this->docxService->generateResumeDocx($resume);
            $fileContent = file_get_contents($tempFilePath);
            @unlink($tempFilePath);
        } else {
            $html = $this->templateRenderer->renderResume($resume, $template);
            $fileContent = $this->pdfService->generatePdfFromHtml($html);
        }

        Storage::disk('local')->put($storagePath, $fileContent);
        $fileSize = strlen($fileContent);

        return Export::create([
            'user_id' => $user->id,
            'resume_id' => $resume->id,
            'cover_letter_id' => null,
            'format' => $format,
            'template' => $template,
            'file_path' => $storagePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'status' => 'completed',
            'download_token' => Str::random(32),
            'expires_at' => now()->addDays(7),
        ]);
    }

    /**
     * Export cover letter to PDF or DOCX.
     */
    public function exportCoverLetter(
        User $user,
        CoverLetter $coverLetter,
        string $format = 'pdf',
    ): Export {
        $cleanTitle = Str::slug($coverLetter->title ?: 'cover-letter');
        $fileName = "{$cleanTitle}-" . date('Ymd_His') . ".{$format}";
        $storageDir = "exports/user_{$user->id}";
        $storagePath = "{$storageDir}/{$fileName}";

        if ($format === 'docx') {
            $tempFilePath = $this->docxService->generateCoverLetterDocx($coverLetter);
            $fileContent = file_get_contents($tempFilePath);
            @unlink($tempFilePath);
        } else {
            $html = $this->templateRenderer->renderCoverLetter($coverLetter);
            $fileContent = $this->pdfService->generatePdfFromHtml($html);
        }

        Storage::disk('local')->put($storagePath, $fileContent);
        $fileSize = strlen($fileContent);

        return Export::create([
            'user_id' => $user->id,
            'resume_id' => $coverLetter->resume_id,
            'cover_letter_id' => $coverLetter->id,
            'format' => $format,
            'template' => 'standard',
            'file_path' => $storagePath,
            'file_name' => $fileName,
            'file_size' => $fileSize,
            'status' => 'completed',
            'download_token' => Str::random(32),
            'expires_at' => now()->addDays(7),
        ]);
    }

    /**
     * Delete an export and its physical file.
     */
    public function deleteExport(Export $export): bool
    {
        if ($export->file_path && Storage::disk('local')->exists($export->file_path)) {
            Storage::disk('local')->delete($export->file_path);
        }

        return (bool) $export->delete();
    }
}
