<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VideoGame extends Model
{
    use HasFactory;

    protected $table = 'video_games';

    // Añade 'slug' a la lista de campos asignables masivamente
    protected $fillable = [
        'rawg_id',
        'name',
        'slug', // Añade este campo
        'description',
        'release_date',
        'image_url',
        'metacritic_score',
        'review_count',
        'developer',
        'publisher'
    ];

    public $timestamps = false;

    protected $casts = [
        'release_date' => 'date',
    ];

    public function reviews()
    {
        return $this->hasMany(Review::class, 'game_id');
    }

    public function lists()
    {
        return $this->belongsToMany(GameList::class, 'list_games', 'game_id', 'list_id');
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class, 'game_genres', 'video_game_id', 'genre_id');
    }

    public function stores()
    {
        return $this->belongsToMany(Store::class, 'game_stores', 'video_game_id', 'store_id');
    }

    public function platforms()
    {
        return $this->belongsToMany(Platform::class, 'game_platform', 'video_game_id', 'platform_id');
    }
}
