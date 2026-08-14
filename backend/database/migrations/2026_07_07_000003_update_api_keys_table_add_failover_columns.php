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
        Schema::table('api_keys', function (Blueprint $table) {
            $table->string('provider')->default('groq')->after('user_id');
            $table->unsignedInteger('priority')->default(1)->after('key');
            $table->unsignedBigInteger('usage_count')->default(0)->after('status');
            $table->timestamp('last_used_at')->nullable()->after('usage_count');
            $table->timestamp('cooldown_until')->nullable()->after('last_used_at');
            $table->timestamp('last_failed_at')->nullable()->after('cooldown_until');
            $table->string('failure_reason')->nullable()->after('last_failed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('api_keys', function (Blueprint $table) {
            $table->dropColumn([
                'provider',
                'priority',
                'usage_count',
                'last_used_at',
                'cooldown_until',
                'last_failed_at',
                'failure_reason',
            ]);
        });
    }
};
