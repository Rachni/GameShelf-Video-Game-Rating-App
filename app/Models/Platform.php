<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Platform extends Model
{
    use HasFactory;

    /**
     * Los atributos que son asignables en masa.
     *
     * @var array
     */
    protected $fillable = [
        'name', // Nombre de la plataforma
    ];

    /**
     * Obtener los videojuegos asociados con esta plataforma.
     */
    public function videoGames()
    {
        return $this->belongsToMany(VideoGame::class, 'game_platform', 'platform_id', 'video_game_id');
    }
}