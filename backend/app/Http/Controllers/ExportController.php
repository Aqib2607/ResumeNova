<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Resources\ExportResource;
use App\Models\CoverLetter;
use App\Models\Export;
use App\Models\Resume;
use App\Services\Export\ExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportController extends Controller
{
    public function __construct(
        protected ExportService $exportService,
    ) {}

    /**
     * List current user's export history.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = (int) $request->query('per_page', 15);
        $exports = $this->exportService->listUserExports($request->user(), $perPage);

        return ExportResource::collection($exports);
    }

    /**
     * Trigger resume export to PDF or DOCX.
     */
    public function exportResume(Request $request, Resume $resume): JsonResponse
    {
        Gate::authorize('view', $resume);

        $validated = $request->validate([
            'format' => ['nullable', 'string', 'in:pdf,docx'],
            'template' => ['nullable', 'string', 'max:100'],
        ]);

        $format = $validated['format'] ?? 'pdf';
        $template = $validated['template'] ?? ($resume->template ?: 'modern-professional');

        $export = $this->exportService->exportResume(
            user: $request->user(),
            resume: $resume,
            format: $format,
            template: $template,
        );

        return (new ExportResource($export->load(['resume', 'coverLetter'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Trigger cover letter export to PDF or DOCX.
     */
    public function exportCoverLetter(Request $request, CoverLetter $coverLetter): JsonResponse
    {
        Gate::authorize('view', $coverLetter);

        $validated = $request->validate([
            'format' => ['nullable', 'string', 'in:pdf,docx'],
        ]);

        $format = $validated['format'] ?? 'pdf';

        $export = $this->exportService->exportCoverLetter(
            user: $request->user(),
            coverLetter: $coverLetter,
            format: $format,
        );

        return (new ExportResource($export->load(['resume', 'coverLetter'])))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show export metadata.
     */
    public function show(Request $request, Export $export): ExportResource
    {
        Gate::authorize('view', $export);

        return new ExportResource($export->load(['resume', 'coverLetter']));
    }

    /**
     * Securely download generated export document.
     */
    public function download(Request $request, Export $export): StreamedResponse
    {
        Gate::authorize('download', $export);

        if (!$export->file_path || !Storage::disk('local')->exists($export->file_path)) {
            abort(404, 'Export file not found or expired.');
        }

        $mimeType = $export->format === 'docx'
            ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/pdf';

        return Storage::disk('local')->download($export->file_path, $export->file_name, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => "attachment; filename=\"{$export->file_name}\"",
        ]);
    }

    /**
     * Delete an export record and file.
     */
    public function destroy(Request $request, Export $export): JsonResponse
    {
        Gate::authorize('delete', $export);

        $this->exportService->deleteExport($export);

        return response()->json([
            'message' => 'Export deleted successfully.',
        ]);
    }
}
