<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('game_platform', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('video_game_id');
            $table->unsignedBigInteger('platform_id');
            $table->timestamps();
    
            // Claves foráneas
            $table->foreign('video_game_id')->references('id')->on('video_games')->onDelete('cascade');
            $table->foreign('platform_id')->references('id')->on('platforms')->onDelete('cascade');
    
            // Evitar duplicados
            $table->unique(['video_game_id', 'platform_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('game_platform');
    }
};
