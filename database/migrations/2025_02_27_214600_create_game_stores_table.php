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
        Schema::create('game_stores', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('video_game_id');
            $table->unsignedBigInteger('store_id');
            $table->timestamps();

            // Claves foráneas
            $table->foreign('video_game_id')->references('id')->on('video_games')->onDelete('cascade');
            $table->foreign('store_id')->references('id')->on('stores')->onDelete('cascade');
        });
    }
};
