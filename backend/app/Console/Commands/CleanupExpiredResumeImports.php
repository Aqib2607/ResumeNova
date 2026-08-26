<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\ResumeImport;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class CleanupExpiredResumeImports extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'resume-imports:cleanup';

    /**
     * The console command description.
     */
    protected $description = 'Clean up expired and abandoned temporary resume import records and files';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting expired resume imports cleanup...');

        $expiredImports = ResumeImport::expired()->get();
        $count = $expiredImports->count();

        if ($count === 0) {
            $this->info('No expired resume imports found.');
            return self::SUCCESS;
        }

        $deletedCount = 0;
        foreach ($expiredImports as $import) {
            try {
                // Delete temporary file if it still exists on disk
                if (!empty($import->file_path)) {
                    $disk = Storage::disk($import->disk);
                    if ($disk->exists($import->file_path)) {
                        $disk->delete($import->file_path);
                    }
                }

                // Delete the import record
                $import->delete();
                $deletedCount++;
            } catch (Throwable $e) {
                Log::warning("Failed to clean up expired ResumeImport #{$import->id}: " . $e->getMessage());
                $this->warn("Failed to clean up import #{$import->id}: {$e->getMessage()}");
            }
        }

        $this->info("Successfully cleaned up {$deletedCount} / {$count} expired resume imports.");
        Log::info("CleanupExpiredResumeImports completed: {$deletedCount} records purged.");

        return self::SUCCESS;
    }
}
