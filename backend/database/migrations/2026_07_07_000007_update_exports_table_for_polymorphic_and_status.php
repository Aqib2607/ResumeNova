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
        Schema::table('exports', function (Blueprint $table) {
            $table->foreignId('resume_id')->nullable()->change();
            $table->foreignId('cover_letter_id')->nullable()->after('resume_id')->constrained('cover_letters')->nullOnDelete();
            $table->string('template', 100)->nullable()->after('format');
            $table->string('file_name')->nullable()->after('file_path');
            $table->unsignedBigInteger('file_size')->nullable()->after('file_name');
            $table->string('status', 30)->default('completed')->after('file_size');
            $table->string('download_token', 64)->nullable()->after('status');
            $table->timestamp('expires_at')->nullable()->after('download_token');

            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exports', function (Blueprint $table) {
            $table->dropForeign(['cover_letter_id']);
            $table->dropColumn([
                'cover_letter_id',
                'template',
                'file_name',
                'file_size',
                'status',
                'download_token',
                'expires_at',
            ]);
        });
    }
};
