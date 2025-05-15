<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameList extends Model
{
    use HasFactory;

    protected $table = 'lists';
    protected $fillable = ['name', 'user_id', 'is_favorite'];	
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function games()
    {
        return $this->belongsToMany(VideoGame::class, 'list_games', 'list_id', 'game_id');
    }
}
