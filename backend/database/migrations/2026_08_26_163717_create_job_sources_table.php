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
        Schema::create('job_sources', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('provider_type'); // e.g. public_search, bdjobs, google
            $table->string('base_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->string('health_status')->default('healthy'); // healthy, degraded, failing
            $table->timestamp('last_success_at')->nullable();
            $table->integer('failure_count')->default(0);
            $table->text('last_error')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_sources');
    }
};
