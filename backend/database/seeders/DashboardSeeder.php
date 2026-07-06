<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Resume;
use App\Models\Export;
use App\Models\AtsAnalysis;
use App\Models\AiRequest;
use App\Models\ApiKey;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seeds all existing users, or the first one if none match.
     */
    public function run(): void
    {
        $users = User::all();

        if ($users->isEmpty()) {
            $users = collect([User::factory()->create([
                'name' => 'Demo User',
                'email' => 'demo@example.com',
                'role' => 'admin',
            ])]);
        }

        foreach ($users as $user) {
            $this->seedForUser($user);
        }
    }

    private function seedForUser(User $user): void
    {
        // 1. Create Resumes
        if ($user->resumes()->count() === 0) {
            $resume1 = $user->resumes()->create([
                'title' => 'Senior Frontend Developer',
                'version' => '1.2',
                'updated_at' => now()->subDays(2),
            ]);

            $resume2 = $user->resumes()->create([
                'title' => 'Full Stack Engineer',
                'version' => '2.0',
                'updated_at' => now()->subHours(5),
            ]);

            $user->resumes()->create([
                'title' => 'Product Manager - Vercel',
                'version' => '1.0',
                'updated_at' => now()->subDays(5),
            ]);

            // 2. Create ATS Analyses
            $user->atsAnalyses()->create([
                'resume_id' => $resume1->id,
                'score' => 85,
            ]);
            $user->atsAnalyses()->create([
                'resume_id' => $resume2->id,
                'score' => 72,
            ]);

            // 3. Create Exports
            $user->exports()->create([
                'resume_id' => $resume1->id,
                'format' => 'pdf',
                'created_at' => now()->subDays(1),
            ]);
            $user->exports()->create([
                'resume_id' => $resume2->id,
                'format' => 'docx',
                'created_at' => now()->subDays(3),
            ]);
        }

        // 4. Create AI Requests for the past 7 days
        if ($user->aiRequests()->count() === 0) {
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $user->aiRequests()->create([
                    'endpoint' => '/api/generate',
                    'date' => $date,
                    'calls' => rand(5, 30),
                ]);
            }
        }

        // 5. Create API Keys
        if ($user->apiKeys()->count() === 0) {
            $user->apiKeys()->create([
                'name' => 'Production Key',
                'masked_key' => 'sk-prod-...492a',
                'key' => 'sk-prod-' . Str::random(32),
                'status' => 'active',
            ]);
            $user->apiKeys()->create([
                'name' => 'Development Key',
                'masked_key' => 'sk-dev-...8b1c',
                'key' => 'sk-dev-' . Str::random(32),
                'status' => 'rate_limited',
            ]);
        }

        // 6. Create notifications
        if ($user->notifications()->count() === 0) {
            \DB::table('notifications')->insert([
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'App\Notifications\SystemAlert',
                    'notifiable_type' => get_class($user),
                    'notifiable_id' => $user->id,
                    'data' => json_encode(['title' => 'ATS Analysis Complete', 'body' => 'Your resume scored 85/100.']),
                    'read_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'id' => (string) Str::uuid(),
                    'type' => 'App\Notifications\SystemAlert',
                    'notifiable_type' => get_class($user),
                    'notifiable_id' => $user->id,
                    'data' => json_encode(['title' => 'API Rate Limit Warning', 'body' => 'Development Key is nearing its limit.']),
                    'read_at' => null,
                    'created_at' => now()->subHour(),
                    'updated_at' => now()->subHour(),
                ],
            ]);
        }

        $this->command->info("Seeded data for user: {$user->email}");
    }
}
