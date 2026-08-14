<?php

declare(strict_types=1);

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
        Schema::create('interview_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('resume_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category', 50)->default('technical');
            $table->string('difficulty', 20)->default('medium');
            $table->string('language', 10)->default('en');
            $table->text('job_description')->nullable();
            $table->string('status', 30)->default('in_progress');
            $table->integer('total_questions')->default(5);
            $table->integer('completed_questions')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('interview_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('interview_sessions')->cascadeOnDelete();
            $table->integer('order')->default(1);
            $table->string('category', 50)->nullable();
            $table->string('difficulty', 20)->nullable();
            $table->text('question');
            $table->json('hints')->nullable();
            $table->text('expected_answer')->nullable();
            $table->text('user_answer')->nullable();
            $table->json('evaluation')->nullable();
            $table->integer('score')->nullable();
            $table->timestamps();

            $table->index(['session_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interview_questions');
        Schema::dropIfExists('interview_sessions');
    }
};
