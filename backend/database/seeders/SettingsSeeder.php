<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            [
                'key'       => 'site_name',
                'value'     => 'ResumeNova',
                'group'     => 'general',
                'is_public' => true,
            ],
            [
                'key'       => 'maintenance_mode',
                'value'     => false,
                'group'     => 'system',
                'is_public' => true,
            ],
            [
                'key'       => 'default_theme',
                'value'     => 'light',
                'group'     => 'appearance',
                'is_public' => true,
            ],
            [
                'key'       => 'allowed_file_types',
                'value'     => ['pdf', 'docx', 'txt'],
                'group'     => 'uploads',
                'is_public' => false,
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
