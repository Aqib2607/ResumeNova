<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\JobPosting;
use App\Services\AI\JobMatchingService;
use App\Notifications\HighMatchJobNotification;

class MatchJobAgainstUserJob implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    public function __construct(
        public User $user,
        public JobPosting $jobPosting
    ) {}

    public function handle(JobMatchingService $matchingService): void
    {
        $match = $matchingService->evaluateMatch($this->user, $this->jobPosting);

        if ($match->match_score >= 80) {
            $this->user->notify(new HighMatchJobNotification($match));
        }
    }
}
