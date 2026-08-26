<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. candidate_skills alignment
        if (Schema::hasTable('candidate_skills')) {
            Schema::table('candidate_skills', function (Blueprint $table) {
                if (Schema::hasColumn('candidate_skills', 'skill_name') && !Schema::hasColumn('candidate_skills', 'name')) {
                    $table->renameColumn('skill_name', 'name');
                } elseif (!Schema::hasColumn('candidate_skills', 'name')) {
                    $table->string('name')->after('user_id');
                }

                if (!Schema::hasColumn('candidate_skills', 'is_verified')) {
                    $table->boolean('is_verified')->default(false)->after('proficiency_level');
                }
            });
        }

        // 2. job_preferences alignment
        if (Schema::hasTable('job_preferences')) {
            Schema::table('job_preferences', function (Blueprint $table) {
                if (!Schema::hasColumn('job_preferences', 'titles')) {
                    $table->json('titles')->nullable()->after('user_id');
                }
                if (!Schema::hasColumn('job_preferences', 'locations')) {
                    $table->json('locations')->nullable()->after('titles');
                }
                if (!Schema::hasColumn('job_preferences', 'location_types')) {
                    $table->json('location_types')->nullable()->after('locations');
                }
                if (!Schema::hasColumn('job_preferences', 'employment_types')) {
                    $table->json('employment_types')->nullable()->after('location_types');
                }
                if (!Schema::hasColumn('job_preferences', 'salary_currency')) {
                    $table->string('salary_currency', 10)->default('USD')->after('min_salary');
                }
                if (!Schema::hasColumn('job_preferences', 'industries')) {
                    $table->json('industries')->nullable()->after('salary_currency');
                }
                if (!Schema::hasColumn('job_preferences', 'skills')) {
                    $table->json('skills')->nullable()->after('industries');
                }
            });
        }

        // 3. job_applications alignment
        if (Schema::hasTable('job_applications')) {
            Schema::table('job_applications', function (Blueprint $table) {
                if (!Schema::hasColumn('job_applications', 'resume_id')) {
                    $table->foreignId('resume_id')->nullable()->after('job_posting_id')->constrained('resumes')->nullOnDelete();
                }
                if (!Schema::hasColumn('job_applications', 'metadata')) {
                    $table->json('metadata')->nullable()->after('notes');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('candidate_skills')) {
            Schema::table('candidate_skills', function (Blueprint $table) {
                if (Schema::hasColumn('candidate_skills', 'is_verified')) {
                    $table->dropColumn('is_verified');
                }
                if (Schema::hasColumn('candidate_skills', 'name') && !Schema::hasColumn('candidate_skills', 'skill_name')) {
                    $table->renameColumn('name', 'skill_name');
                }
            });
        }

        if (Schema::hasTable('job_preferences')) {
            Schema::table('job_preferences', function (Blueprint $table) {
                $columns = ['titles', 'locations', 'location_types', 'employment_types', 'salary_currency', 'industries', 'skills'];
                foreach ($columns as $column) {
                    if (Schema::hasColumn('job_preferences', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('job_applications')) {
            Schema::table('job_applications', function (Blueprint $table) {
                if (Schema::hasColumn('job_applications', 'resume_id')) {
                    $table->dropConstrainedForeignId('resume_id');
                }
                if (Schema::hasColumn('job_applications', 'metadata')) {
                    $table->dropColumn('metadata');
                }
            });
        }
    }
};
