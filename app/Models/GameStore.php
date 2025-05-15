<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameStore
extends Model
{

    // Campos asignables (fillable)
    protected $fillable = [
        'video_game_id',
        'genre_id',
    ];

    // Relación con el modelo VideoGame
    public function videoGame()
    {
        return $this->belongsTo(VideoGame::class, 'video_game_id');
    }

    // Relación con el modelo Genre
    public function genre()
    {
        return $this->belongsTo(Genre::class, 'genre_id');
    }
}
