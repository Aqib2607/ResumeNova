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
        Schema::create('ai_checkpoints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('resume_id')->nullable()->constrained()->nullOnDelete();
            $table->string('operation_type'); // resume_summary, resume_experience, ats_analysis, cover_letter, etc.
            $table->string('step')->default('init');
            $table->json('completed_steps')->nullable();
            $table->json('partial_output')->nullable();
            $table->foreignId('active_key_id')->nullable()->constrained('api_keys')->nullOnDelete();
            $table->unsignedInteger('failover_count')->default(0);
            $table->string('status')->default('in_progress'); // in_progress, completed, failed
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_checkpoints');
    }
};
