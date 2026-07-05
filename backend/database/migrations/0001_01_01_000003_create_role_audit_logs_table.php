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
        Schema::create('role_audit_logs', function (Blueprint $table) {
            $table->id();
            
            // The user whose role/status was changed
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // The user who made the change (nullable in case system/seeder does it)
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            
            // The state changes
            $table->string('old_role')->nullable();
            $table->string('new_role')->nullable();
            
            // Optional reason for the change (e.g. for suspensions)
            $table->string('reason')->nullable();
            
            // Context
            $table->string('ip_address', 45)->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_audit_logs');
    }
};
