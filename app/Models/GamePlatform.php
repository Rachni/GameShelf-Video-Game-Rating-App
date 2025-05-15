<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GamePlatform extends Model
{
    protected $table = 'game_platform';

    protected $fillable = [
        'video_game_id',  // id del videojuego
        'platform_id',    // id de la plataforma
    ];

}
