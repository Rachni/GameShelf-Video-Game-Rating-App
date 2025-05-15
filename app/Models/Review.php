<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $table = 'reviews';
    protected $fillable = ['user_id', 'game_id', 'text', 'star_rating', 'likes'];
    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function game()
    {
        return $this->belongsTo(VideoGame::class, 'game_id');
    }

    public function likes()
    {
        return $this->hasMany(ReviewLike::class, 'review_id');
    }
}
