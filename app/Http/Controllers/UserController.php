<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\VideoGame;
use App\Models\Review;
use App\Models\GameList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // Obtener la información básica del usuario
    public function show($username)
    {
        $user = User::where('name', $username)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
                'searched_username' => $username, // debugging
            ], 404);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'profile_pic' => $user->profile_pic,
            'bio' => $user->bio,
            'games_count' => $user->favorites() ? $user->favorites()->games()->count() : 0,
            'reviews_count' => $user->reviews()->count(),
            'lists_count' => $user->lists()->count(),
        ]);
    }

    // Obtener los juegos favoritos del usuario
    public function favorites($username)
    {
        $user = User::where('name', $username)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $favoritesList = $user->favorites();

        if (!$favoritesList) {
            return response()->json([]); // Devolver una lista vacía en lugar de error 500
        }

        $favoriteGames = $favoritesList->games;

        return response()->json($favoriteGames);
    }

    // Obtener las reseñas recientes del usuario
    public function reviews($username)
    {
        $user = User::where('name', $username)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $recentReviews = $user->reviews()->with('game')->latest()->take(10)->get();

        return response()->json($recentReviews);
    }

    // Obtener las listas de juegos del usuario
    public function lists($username)
    {
        $user = User::where('name', $username)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $userLists = $user->lists()->with('games')->get();

        return response()->json($userLists);
    }


    // Obtener las estadísticas de géneros del usuario
    public function genreStats($username)
    {
        $user = User::where('name', $username)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $favoritesList = $user->favorites();

        // Verificar si la lista de favoritos existe y tiene juegos
        if (!$favoritesList || $favoritesList->games()->count() == 0) {
            // Si no hay juegos favoritos, devolver un array vacío en lugar de error 404
            return response()->json([]);
        }

        // Obtener estadísticas de géneros
        $genreStats = DB::table('games')
            ->join('game_game_list', 'games.id', '=', 'game_game_list.game_id')
            ->join('genres', 'games.genre_id', '=', 'genres.id')
            ->where('game_game_list.game_list_id', $favoritesList->id)
            ->select('genres.name', DB::raw('count(*) as count'))
            ->groupBy('genres.name')
            ->get();

        // Verificar si hay estadísticas de géneros
        if ($genreStats->isEmpty()) {
            // Si no se encuentran géneros, devolver un array vacío en lugar de error 404
            return response()->json([]);
        }

        return response()->json($genreStats);
    }
    public function destroy(Request $request)
    {
        $request->validate([
            'confirmation' => 'required|string|in:DELETE' // Solo requerimos confirmación
        ]);

        $user = $request->user();

        try {
            DB::transaction(function () use ($user) {
                // Eliminar todas las relaciones
                $user->lists()->delete();
                $user->reviews()->delete();
                $user->reviewLikes()->delete();

                // Eliminar el usuario
                $user->delete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Account deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete account',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'bio' => 'nullable|string|max:500',
            'profile_pic' => 'nullable|url|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()
        ]);
    }
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 401);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully'
        ]);
    }
    public function getListGenreStats($username)
    {
        // Buscar el usuario por nombre
        $user = User::where('name', $username)->firstOrFail();

        // Obtener todos los juegos en las listas del usuario
        $listGames = DB::table('list_games')
            ->join('lists', 'list_games.list_id', '=', 'lists.id')
            ->where('lists.user_id', $user->id)
            ->select('list_games.game_id')
            ->distinct()
            ->get()
            ->pluck('game_id');

        // Si no hay juegos, devolver un array vacío
        if ($listGames->isEmpty()) {
            return response()->json([]);
        }

        // Obtener los géneros de estos juegos y contarlos
        $genreStats = DB::table('game_genres')
            ->join('genres', 'game_genres.genre_id', '=', 'genres.id')
            ->whereIn('game_genres.video_game_id', $listGames)
            ->select('genres.name', DB::raw('count(*) as count'))
            ->groupBy('genres.name')
            ->orderBy('count', 'desc')
            ->limit(10) // Limitar a los 10 géneros más populares
            ->get();

        return response()->json($genreStats);
    }
}
