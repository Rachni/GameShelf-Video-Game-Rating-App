<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGameGenresTable extends Migration
{
    public function up()
    {
        Schema::create('game_genres', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('video_game_id'); // Clave foránea para video_games
            $table->unsignedBigInteger('genre_id'); // Clave foránea para genres
            $table->timestamps();

            // Definir claves foráneas
            $table->foreign('video_game_id')->references('id')->on('video_games')->onDelete('cascade');
            $table->foreign('genre_id')->references('id')->on('genres')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('game_genres');
    }
}
