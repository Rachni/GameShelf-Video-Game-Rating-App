<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = ['name', 'email', 'password', 'profile_pic', 'bio'];
    protected $hidden = ['password', 'remember_token'];
    public $timestamps = false;

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    // Relación con listas de juegos
    public function lists()
    {
        return $this->hasMany(GameList::class, 'user_id');
    }

    // Relación con reseñas
    public function reviews()
    {
        return $this->hasMany(Review::class, 'user_id');
    }

    // Relación con likes de reseñas
    public function reviewLikes()
    {
        return $this->hasMany(ReviewLike::class, 'user_id');
    }

    // Obtener la lista de favoritos
    public function favorites()
    {
        return $this->lists()->where('is_favorite', true)->first();
    }

    // Crear la lista de favoritos
    public function createFavoritesList()
    {
        return $this->lists()->create([
            'name' => 'Favorites',
            'is_favorite' => true,
        ]);
    }

    // Accesores para contar juegos, reseñas y listas
    public function getGamesCountAttribute()
    {
        return $this->favorites() ? $this->favorites()->games()->count() : 0;
    }

    public function getReviewsCountAttribute()
    {
        return $this->reviews()->count();
    }

    public function getListsCountAttribute()
    {
        return $this->lists()->count();
    }
}
