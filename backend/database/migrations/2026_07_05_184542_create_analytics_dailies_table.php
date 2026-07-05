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
        Schema::create('analytics_dailies', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->integer('active_users')->default(0);
            $table->integer('new_users')->default(0);
            $table->integer('page_views')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_dailies');
    }
};
