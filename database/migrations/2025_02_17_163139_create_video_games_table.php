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
        Schema::create('video_games', function (Blueprint $table) {
            $table->id();
            $table->integer('rawg_id')->unique();
            $table->string('name', 255);
            $table->text('description')->nullable();
            $table->date('release_date')->nullable();
            $table->string('image_url', 255)->nullable();
            $table->json('platforms')->nullable();
            $table->integer('metacritic_score')->nullable();
            $table->integer('review_count')->nullable();
            $table->string('developer', 255)->nullable();
            $table->string('publisher', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('video_games');
    }
};
