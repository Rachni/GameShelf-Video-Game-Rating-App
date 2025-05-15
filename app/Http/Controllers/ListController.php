<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\GameList;
use App\Models\ListGame;
use App\Models\VideoGame;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class ListController extends Controller
{
    /**
     * Get all lists for the authenticated user
     */
    public function index(Request $request)
    {
        try {
            $lists = $request->user()->lists()->get();
            return response()->json($lists);
        } catch (\Exception $e) {

            return response()->json(['error' => 'Server error'], 500);
        }
    }

    /**
     * Create a new list
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        $list = new GameList();
        $list->name = $request->name;
        $list->user_id = $user->id;
        $list->is_favorite = false;
        $list->save();

        return response()->json($list, 201);
    }

    /**
     * Get a specific list with its games
     */
    public function show($id)
    {
        $user = Auth::user();
        $list = GameList::where('id', $id)
            ->where('user_id', $user->id)
            ->with(['games' => function ($query) {
                $query->select('video_games.*');
            }])
            ->firstOrFail();

        return response()->json($list);
    }

    /**
     * Update a list
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user = Auth::user();
        $list = GameList::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Don't allow renaming the favorites list
        if ($list->is_favorite) {
            return response()->json(['message' => 'Cannot rename the favorites list'], 403);
        }

        $list->name = $request->name;
        $list->save();

        return response()->json($list);
    }

    /**
     * Delete a list
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $list = GameList::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // Don't allow deleting the favorites list
        if ($list->is_favorite) {
            return response()->json(['message' => 'Cannot delete the favorites list'], 403);
        }

        // Delete all games from the list first
        ListGame::where('list_id', $list->id)->delete();

        // Then delete the list
        $list->delete();

        return response()->json(['message' => 'List deleted successfully']);
    }

    /**
     * Add a game to a list
     */
    public function addGame(Request $request, $listId)
    {
        $request->validate([
            'game_id' => 'required|integer|exists:video_games,id'
        ]);

        try {
            $user = Auth::user();
            $list = GameList::where('id', $listId)
                ->where('user_id', $user->id)
                ->first();

            if (!$list) {
                return response()->json(['message' => 'List not found or not owned by user'], 404);
            }

            // Verifica si el juego ya está en la lista usando la relación
            if ($list->games()->where('video_games.id', $request->game_id)->exists()) {
                return response()->json(['message' => 'Game already in list'], 409);
            }

            // Usa la relación para agregar el juego
            $list->games()->attach($request->game_id);

            return response()->json([
                'message' => 'Game added successfully',
                'game' => VideoGame::find($request->game_id)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Internal Server Error',
                'error' => $e->getMessage() // Solo para desarrollo
            ], 500);
        }
    }

    /**
     * Remove a game from a list
     */
    public function removeGame($listId, $gameId)
    {
        $user = Auth::user();
        $list = GameList::where('id', $listId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $listGame = ListGame::where('list_id', $list->id)
            ->where('game_id', $gameId)
            ->firstOrFail();

        $listGame->delete();

        return response()->json(['message' => 'Game removed from list successfully']);
    }
    /**
     * Obtener estadísticas de géneros de juegos favoritos
     */
    public function genreStats($username)
    {
        try {
            $user = User::where('username', $username)->firstOrFail();

            // Obtener estadísticas de géneros de juegos favoritos
            $stats = VideoGame::whereHas('favoritedBy', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->with('genres')
                ->get()
                ->flatMap(function ($game) {
                    return $game->genres;
                })
                ->groupBy('name')
                ->map(function ($genres, $name) {
                    return [
                        'name' => $name,
                        'count' => $genres->count()
                    ];
                })
                ->sortByDesc('count')
                ->values();

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas de géneros',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de géneros en listas de juegos
     */
    public function getListGenreStats($username)
    {
        try {
            $user = User::where('username', $username)->firstOrFail();

            // Obtener estadísticas de géneros en listas
            $stats = ListGame::whereHas('list', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
                ->with('game.genres')
                ->get()
                ->flatMap(function ($listGame) {
                    return $listGame->game->genres ?? [];
                })
                ->groupBy('name')
                ->map(function ($genres, $name) {
                    return [
                        'name' => $name,
                        'count' => $genres->count()
                    ];
                })
                ->sortByDesc('count')
                ->values();

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas de géneros en listas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Muestra una lista pública de juegos
     *
     * @param string $username
     * @param int $listId
     * @return \Illuminate\Http\JsonResponse
     */
    public function showPublicList($username, $listId)
    {
        // 1. Buscar el usuario por username
        $user = User::where('name', $username)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // 2. Buscar la lista que pertenezca a ese usuario
        $list = GameList::with(['games' => function ($query) {
            $query->select('video_games.id', 'name', 'image_url', 'slug');
        }])
            ->where('id', $listId)
            ->where('user_id', $user->id)
            ->first();

        if (!$list) {
            return response()->json([
                'message' => 'List not found or not public'
            ], 404);
        }

        // 3. Formatear la respuesta
        return response()->json([
            'list' => [
                'id' => $list->id,
                'name' => $list->name,
                'is_favorite' => $list->is_favorite,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'name' => $user->name,
                    'profile_pic' => $user->profile_pic
                ],
                'games' => $list->games->map(function ($game) {
                    return [
                        'id' => $game->id,
                        'name' => $game->name,
                        'image_url' => $game->image_url,
                        'slug' => $game->slug
                    ];
                }),
                'created_at' => $list->created_at,
                'updated_at' => $list->updated_at
            ]
        ]);
    }
}
