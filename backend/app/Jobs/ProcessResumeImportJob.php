<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\ResumeImport;
use App\Services\AI\ResumeParserService;
use App\Services\ResumeFileExtractorService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ProcessResumeImportJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * The maximum number of unhandled exceptions to allow before failing.
     */
    public int $maxExceptions = 2;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public ResumeImport $import
    ) {}

    /**
     * Execute the job.
     */
    public function handle(
        ResumeFileExtractorService $extractor,
        ResumeParserService $parser
    ): void {
        $import = $this->import->fresh();

        if (!$import || in_array($import->status, [ResumeImport::STATUS_COMPLETED, ResumeImport::STATUS_EXPIRED], true)) {
            Log::info("ResumeImport #{$this->import->id} skipped (status: {$import?->status})");
            return;
        }

        Log::info("Processing ResumeImport #{$import->id} for User #{$import->user_id}");

        $import->update(['status' => ResumeImport::STATUS_PROCESSING]);

        $disk = Storage::disk($import->disk);
        $fullPath = $disk->path($import->file_path);

        try {
            if (!$disk->exists($import->file_path)) {
                throw new \RuntimeException("Uploaded resume file [{$import->file_path}] is missing from disk.");
            }

            // 1. Extract text
            $extractedText = $extractor->extractText(
                $fullPath,
                pathinfo($import->original_filename, PATHINFO_EXTENSION)
            );

            // 2. Parse text with Groq AI and normalize schema
            $parsedContent = $parser->parse(
                user: $import->user,
                rawText: $extractedText,
                originalFilename: $import->original_filename
            );

            // 3. Persist parsed content and set status to ready
            $import->update([
                'status' => ResumeImport::STATUS_READY,
                'parsed_content' => $parsedContent,
                'error_message' => null,
            ]);

            // 4. Delete the temporary file now that extraction & persistence are complete
            if ($disk->exists($import->file_path)) {
                $disk->delete($import->file_path);
            }

            Log::info("ResumeImport #{$import->id} successfully parsed and ready for review.");
        } catch (Throwable $e) {
            Log::error("ResumeImport #{$import->id} failed: " . $e->getMessage());

            $import->update([
                'status' => ResumeImport::STATUS_FAILED,
                'error_message' => $e->getMessage(),
            ]);

            // Ensure temporary file is cleaned up even on failure
            try {
                if ($disk->exists($import->file_path)) {
                    $disk->delete($import->file_path);
                }
            } catch (Throwable $cleanupError) {
                Log::warning("Failed to delete temp file on import failure #{$import->id}: " . $cleanupError->getMessage());
            }

            // If running asynchronously in a queue worker, rethrow to allow worker retries.
            // If running synchronously, do not crash the HTTP request so the frontend can poll and display the recorded error.
            if ($this->job && config('queue.default') !== 'sync') {
                throw $e;
            }
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(?Throwable $exception): void
    {
        $import = $this->import->fresh();
        if ($import && $import->status !== ResumeImport::STATUS_READY) {
            $import->update([
                'status' => ResumeImport::STATUS_FAILED,
                'error_message' => $exception ? $exception->getMessage() : 'Import processing timed out or failed.',
            ]);

            // Clean up temporary file
            try {
                $disk = Storage::disk($import->disk);
                if ($disk->exists($import->file_path)) {
                    $disk->delete($import->file_path);
                }
            } catch (Throwable) {
                // Ignore cleanup error on final failure
            }
        }
    }
}
