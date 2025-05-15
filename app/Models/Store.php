<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Store extends Model
{
    use HasFactory;

    // Campos asignables (fillable)
    protected $fillable = [
        'name',
        'website',
        'logo_url',
        'description',
    ];

    // Relación muchos a muchos con VideoGame (a través de la tabla pivote game_store)
    public function videoGames()
    {
        return $this->belongsToMany(VideoGame::class, 'game_store', 'store_id', 'video_game_id')
            ->withTimestamps();
    }
}
