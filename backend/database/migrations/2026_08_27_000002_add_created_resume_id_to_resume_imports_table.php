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
        Schema::table('resume_imports', function (Blueprint $table) {
            if (!Schema::hasColumn('resume_imports', 'created_resume_id')) {
                $table->foreignId('created_resume_id')
                    ->nullable()
                    ->after('status')
                    ->constrained('resumes')
                    ->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resume_imports', function (Blueprint $table) {
            if (Schema::hasColumn('resume_imports', 'created_resume_id')) {
                $table->dropForeign(['created_resume_id']);
                $table->dropColumn('created_resume_id');
            }
        });
    }
};
