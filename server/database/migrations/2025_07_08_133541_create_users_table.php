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
        Schema::create('planning_poker_users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_host')->default(false);
            $table->boolean('is_connected')->default(true);
            $table->string('vote', 50)->nullable();
            $table->boolean('has_voted')->default(false);
            $table->unsignedBigInteger('room_id');
            $table->timestamps();
            
            $table->index('room_id');
            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('planning_poker_users');
    }
};