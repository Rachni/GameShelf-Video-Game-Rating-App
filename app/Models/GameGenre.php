<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameGenre extends Model
{
    use HasFactory;

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
