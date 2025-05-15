<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ListGame extends Model
{
    protected $fillable = ['list_id', 'game_id'];

    protected $table = 'list_games';

    public function list()
    {
        return $this->belongsTo(GameList::class, 'list_id');
    }
    public function game()
    {
        return $this->belongsTo(VideoGame::class, 'game_id');
    }
}