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
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_code', 6)->unique();
            $table->string('name');
            $table->unsignedBigInteger('host_id')->nullable();
            $table->boolean('is_voting_revealed')->default(false);
            $table->unsignedBigInteger('current_story_id')->nullable();
            $table->string('voting_system_name', 100)->default('Fibonacci');
            $table->timestamps();
            
            $table->index('room_code');
            $table->index('host_id');
            $table->index('current_story_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};