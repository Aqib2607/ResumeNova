<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use App\Jobs\DiscoverJobsJob;

Schedule::job(new DiscoverJobsJob)->hourly()->withoutOverlapping(60);
Schedule::command('resume-imports:cleanup')->hourly();
