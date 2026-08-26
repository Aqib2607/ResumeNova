<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use App\Models\JobMatch;

class HighMatchJobNotification extends Notification
{
    use Queueable;

    public function __construct(
        public JobMatch $jobMatch
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $jobTitle = $this->jobMatch->jobPosting->title;
        $company = $this->jobMatch->jobPosting->company;

        return [
            'title' => "High Job Match: {$jobTitle}",
            'message' => "You have a {$this->jobMatch->match_score}% skill match for '{$jobTitle}' at {$company}.",
            'job_match_id' => $this->jobMatch->id,
            'job_posting_id' => $this->jobMatch->job_posting_id,
            'match_score' => $this->jobMatch->match_score,
        ];
    }
}
