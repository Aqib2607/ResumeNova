<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\ResumeImport\ConfirmResumeImportRequest;
use App\Http\Requests\ResumeImport\UploadResumeImportRequest;
use App\Http\Resources\ResumeResource;
use App\Jobs\ProcessResumeImportJob;
use App\Models\ResumeImport;
use App\Services\ResumeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResumeUploadController extends Controller
{
    public function __construct(
        protected ResumeService $resumeService
    ) {}

    /**
     * Handle initial file upload, create ResumeImport, and dispatch asynchronous processing job.
     */
    public function upload(UploadResumeImportRequest $request): JsonResponse
    {
        $user = $request->user();
        $file = $request->file('file');

        $originalFilename = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension() ?: 'pdf';
        $uuid = Str::uuid()->toString();
        $storedFilename = "{$uuid}.{$extension}";

        // Store file securely in private app storage
        $storedPath = $file->storeAs("resume-imports/{$user->id}", $storedFilename, 'local');

        $import = ResumeImport::create([
            'user_id' => $user->id,
            'original_filename' => $originalFilename,
            'disk' => 'local',
            'file_path' => $storedPath,
            'status' => ResumeImport::STATUS_PENDING,
            'expires_at' => now()->addHours(24),
        ]);

        // Dispatch background extraction and AI parsing job
        ProcessResumeImportJob::dispatch($import);

        Log::info("Resume upload initiated [User #{$user->id}, Import #{$import->id}, File: {$originalFilename}]");

        return response()->json([
            'data' => [
                'id' => (string) $import->id,
                'status' => $import->status,
                'original_filename' => $import->original_filename,
                'expires_at' => $import->expires_at?->toIso8601String(),
            ],
            'import_id' => $import->id,
            'id' => (string) $import->id,
            'status' => $import->status,
            'original_filename' => $import->original_filename,
            'expires_at' => $import->expires_at?->toIso8601String(),
        ], 201);
    }

    /**
     * Check status and retrieve parsed content for an ongoing or completed import.
     */
    public function status(ResumeImport $import, Request $request): JsonResponse
    {
        Gate::authorize('view', $import);

        // Server-side processing timeout detection (if job hung for > 2 minutes)
        if ($import->status === ResumeImport::STATUS_PROCESSING && $import->updated_at < now()->subMinutes(2)) {
            $import->update([
                'status' => ResumeImport::STATUS_FAILED,
                'error_message' => 'Document processing timed out. Please try uploading again.',
            ]);
        }

        return response()->json([
            'data' => [
                'id' => (string) $import->id,
                'status' => $import->status,
                'original_filename' => $import->original_filename,
                'parsed_content' => $import->parsed_content,
                'error_message' => $import->error_message,
                'expires_at' => $import->expires_at?->toIso8601String(),
            ],
            'id' => (string) $import->id,
            'status' => $import->status,
            'original_filename' => $import->original_filename,
            'parsed_content' => $import->parsed_content,
            'error_message' => $import->error_message,
            'expires_at' => $import->expires_at?->toIso8601String(),
        ], 200);
    }

    /**
     * Confirm reviewed and edited resume import data to create the final official Resume.
     * Idempotent and executed within a database transaction.
     */
    public function confirm(ConfirmResumeImportRequest $request, ResumeImport $import): JsonResponse
    {
        Gate::authorize('confirm', $import);

        $user = $request->user();

        return DB::transaction(function () use ($request, $import, $user) {
            /** @var ResumeImport $lockedImport */
            $lockedImport = ResumeImport::where('id', $import->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Idempotent check: if already confirmed and resume exists, return the existing resume
            if ($lockedImport->status === ResumeImport::STATUS_COMPLETED && $lockedImport->created_resume_id) {
                $existingResume = $lockedImport->createdResume ?? Resume::where('id', $lockedImport->created_resume_id)->where('user_id', $user->id)->first();
                if ($existingResume) {
                    return (new ResumeResource($existingResume))
                        ->response()
                        ->setStatusCode(200);
                }
            }

            if (!$lockedImport->isEligibleForConfirmation()) {
                return response()->json([
                    'message' => 'This import is no longer eligible for confirmation or has already been processed.'
                ], 409);
            }

            // Create the official Resume using the existing ResumeService contract
            $resume = $this->resumeService->createForUser(
                $user,
                $request->toNormalizedResumeData()
            );

            // Mark import record as completed and purge temporary parsed payload
            $lockedImport->update([
                'status' => ResumeImport::STATUS_COMPLETED,
                'created_resume_id' => $resume->id,
                'parsed_content' => null,
            ]);

            Log::info("ResumeImport #{$lockedImport->id} confirmed and converted to Resume #{$resume->id} for User #{$user->id}");

            return (new ResumeResource($resume))
                ->response()
                ->setStatusCode(201);
        });
    }

    /**
     * Cancel an import and clean up associated files.
     */
    public function cancel(ResumeImport $import, Request $request): JsonResponse
    {
        Gate::authorize('delete', $import);

        // Delete temporary upload file if still present
        if (!empty($import->file_path)) {
            $disk = Storage::disk($import->disk);
            if ($disk->exists($import->file_path)) {
                $disk->delete($import->file_path);
            }
        }

        $import->delete();

        return response()->json([
            'message' => 'Resume import cancelled and discarded successfully.',
        ], 200);
    }
}
