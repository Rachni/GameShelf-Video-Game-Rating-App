<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ListController;
// Rutas de autenticación

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/user', [AuthController::class, 'getUser']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

// Rutas de juegos

Route::get('/search-games', [GameController::class, 'search']);
Route::get('/games/{slug}', [GameController::class, 'getDetailsBySlug']);
Route::get('/top-games', [GameController::class, 'getTopGames']);
Route::get('/games/{slug}/reviews', [GameController::class, 'getReviewsBySlug']);

//Rutas de usuario 

// Ruta para obtener el perfil de un usuario
Route::get('/users/{username}', [UserController::class, 'show']);

// Ruta para obtener los juegos favoritos de un usuario
Route::get('/users/{username}/favorites', [UserController::class, 'favorites']);

// Ruta para obtener las reseñas recientes de un usuario
Route::get('/users/{username}/reviews', [UserController::class, 'reviews']);

// Ruta para obtener las listas de juegos de un usuario
Route::get('/users/{username}/lists', [UserController::class, 'lists']);

// Rutas de Reviews
Route::get('/games/{slug}/reviews', [ReviewController::class, 'getReviewsBySlug']);
Route::post('/games/{slug}/reviews', [ReviewController::class, 'rate'])->middleware('auth:sanctum');
Route::post('/reviews/{reviewId}/toggle-like', [ReviewController::class, 'toggleLike'])->middleware('auth:sanctum');
Route::get('/reviews/recent', [ReviewController::class, 'getRecentReviews']);




Route::middleware('auth:sanctum')->delete('/user', [UserController::class, 'destroy']);

// Auth routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::post('/user/password', [UserController::class, 'updatePassword']);

    Route::get('/games/{slug}/user-rating', [ReviewController::class, 'getUserRating']);

    // LISTS
    Route::delete('/user', [UserController::class, 'destroy']);
    Route::get('/lists', [ListController::class, 'index']);
    Route::post('/lists', [ListController::class, 'store']);
    Route::get('/lists/{id}', [ListController::class, 'show']);
    Route::put('/lists/{id}', [ListController::class, 'update']);
    Route::delete('/lists/{id}', [ListController::class, 'destroy']);
    Route::get('/users/{username}/lists/{listId}', [UserController::class, 'show']);

    // Game list management
    Route::post('/lists/{listId}/games', [ListController::class, 'addGame'])->middleware('auth:sanctum');
    Route::delete('/lists/{listId}/games/{gameId}', [ListController::class, 'removeGame']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/games/rate', [ReviewController::class, 'rateGame']);
});
Route::middleware('auth:sanctum')->get('/auth/check', function () {
    return response()->json(['authenticated' => true]);
});
Route::get('/users/{username}/lists/{listId}', [ListController::class, 'showPublicList']);
Route::get('/users/{username}/stats/list-genres', [UserController::class, 'getListGenreStats']);
Route::get('/platforms', [GameController::class, 'getPlatforms']);
Route::get('/genres', [GameController::class, 'getGenres']);
Route::get('/stores', [GameController::class, 'getStores']);
Route::get('/games/filter', [GameController::class, 'filterGames']);
