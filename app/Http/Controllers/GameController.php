<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use GuzzleHttp\Client;
use App\Models\VideoGame;
use App\Models\Genre;
use App\Models\Platform;
use App\Models\Store;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class GameController extends Controller
{
    /**
     * Buscar juegos en la base de datos local o en la API de RAWG.io.
     */
    public function search(Request $request)
    {
        // Validar el parámetro de búsqueda
        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        // Normalizar la cadena: eliminar espacios excesivos, convertir a minúsculas
        $searchQuery = trim(preg_replace('/\s+/', ' ', strtolower($request->input('query'))));
        $isApiSearch = $request->input('api_search', false);

        // Crear clave de caché
        $cacheKey = 'search_games_' . md5($searchQuery . '_' . $request->input('page', 1));

        if (Cache::has($cacheKey)) {
            return response()->json(Cache::get($cacheKey));
        }

        // Buscar en base de datos usando búsqueda flexible
        $localResults = VideoGame::where(function ($query) use ($searchQuery) {
            $terms = explode(' ', $searchQuery);

            foreach ($terms as $term) {
                $query->where(function ($q) use ($term) {
                    $q->where('name', 'like', '%' . $term . '%')
                        ->orWhere('slug', 'like', '%' . $term . '%');
                });
            }
        })
            ->orderByRaw("CASE 
            WHEN name = ? THEN 1 
            WHEN name LIKE ? THEN 2 
            WHEN slug = ? THEN 3
            WHEN slug LIKE ? THEN 4
            ELSE 5 
        END", [
                $searchQuery,
                $searchQuery . '%',
                $searchQuery,
                $searchQuery . '%'
            ])
            ->with(['genres', 'stores', 'platforms'])
            ->paginate(12);

        if ($localResults->isNotEmpty() && !$isApiSearch) {
            $response = [
                'games' => $localResults->items(),
                'total' => $localResults->total(),
                'per_page' => $localResults->perPage(),
                'current_page' => $localResults->currentPage(),
                'last_page' => $localResults->lastPage(),
                'has_more' => true,
            ];

            Cache::put($cacheKey, $response, 60);

            return response()->json($response);
        }

        return $this->searchInApi($searchQuery);
    }


    /**
     * Buscar juegos en la API de RAWG.io y guardarlos en la base de datos.
     */
    private function searchInApi($searchQuery)
    {
        $apiKey = env('RAWG_API_KEY');
        $client = new Client();

        try {
            // Realizar la solicitud a la API de RAWG.io
            $response = $client->get('https://api.rawg.io/api/games', [
                'query' => [
                    'key' => $apiKey,
                    'search' => $searchQuery,
                    'search_precise' => true, // Buscar coincidencias precisas
                    'page_size' => 5, // Limitar el número de resultados
                    'ordering' => '-metacritic', // Ordenar por puntuación de Metacritic
                ],
            ]);

            $apiData = json_decode($response->getBody(), true);

            if (!empty($apiData['results'])) {
                $results = [];

                foreach ($apiData['results'] as $gameData) {
                    // Verificar si el juego ya existe en la base de datos local
                    $existingGame = VideoGame::where('rawg_id', $gameData['id'])->first();

                    if ($existingGame) {
                        // Si el juego ya existe, agregarlo a los resultados
                        $results[] = $existingGame;
                        continue;
                    }

                    // Obtener detalles completos del juego desde la API
                    $detailsResponse = $client->get("https://api.rawg.io/api/games/{$gameData['id']}", [
                        'query' => [
                            'key' => $apiKey,
                        ],
                    ]);

                    $gameDetails = json_decode($detailsResponse->getBody(), true);

                    // Combinar datos básicos con detalles
                    $gameData = array_merge($gameData, $gameDetails);

                    // Generar el slug a partir del nombre del juego
                    $slug = Str::slug($gameData['name']);

                    // Verificar si el slug ya existe en la base de datos
                    $existingSlug = VideoGame::where('slug', $slug)->exists();
                    if ($existingSlug) {
                        // Si el slug ya existe, agregar un sufijo único (por ejemplo, el ID de RAWG)
                        $slug = $slug . '-' . $gameData['id'];
                    }

                    // Guardar el juego en la base de datos
                    $game = VideoGame::create([
                        'rawg_id' => $gameData['id'],
                        'name' => $gameData['name'],
                        'slug' => $slug, // Asegúrate de incluir el slug aquí
                        'description' => isset($gameData['description']) ? strip_tags($gameData['description']) : null,
                        'release_date' => $gameData['released'] ?? null,
                        'image_url' => $gameData['background_image'] ?? null,
                        'metacritic_score' => $gameData['metacritic'] ?? null,
                        'review_count' => $gameData['reviews_count'] ?? 0,
                        'developer' => isset($gameData['developers'][0]) ? $gameData['developers'][0]['name'] : null,
                        'publisher' => isset($gameData['publishers'][0]) ? $gameData['publishers'][0]['name'] : null,
                    ]);

                    // Guardar géneros
                    if (!empty($gameData['genres'])) {
                        foreach ($gameData['genres'] as $genreData) {
                            $genre = Genre::firstOrCreate(['name' => $genreData['name']]);
                            $game->genres()->syncWithoutDetaching($genre->id);
                        }
                    }

                    // Guardar plataformas
                    if (!empty($gameData['platforms'])) {
                        foreach ($gameData['platforms'] as $platformData) {
                            $platformName = $platformData['platform']['name'];
                            $platform = Platform::firstOrCreate(['name' => $platformName]);
                            $game->platforms()->syncWithoutDetaching($platform->id);
                        }
                    }

                    // Guardar tiendas
                    if (!empty($gameData['stores'])) {
                        foreach ($gameData['stores'] as $storeData) {
                            $store = Store::firstOrCreate(
                                ['name' => $storeData['store']['name']],
                                [
                                    'website' => $storeData['store']['domain'] ?? null,
                                    'logo_url' => null,
                                    'description' => null,
                                ]
                            );
                            $game->stores()->syncWithoutDetaching($store->id);
                        }
                    }

                    // Cargar relaciones para la respuesta
                    $game->load(['genres', 'stores', 'platforms']);

                    $results[] = $game;
                }

                return response()->json([
                    'games' => $results,
                    'has_more' => false, // Indica que no hay más resultados en la API
                ]);
            }

            return response()->json(['error' => 'No se encontraron resultados en la API'], 404);
        } catch (\Exception $e) {
            Log::error('Error al buscar juego en API: ' . $e->getMessage(), [
                'query' => $searchQuery,
                'trace' => $e->getTraceAsString(), // Agrega el trace completo para más detalles
            ]);
            return response()->json(['error' => 'Error al buscar el juego: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Obtener detalles de un juego por su ID o RAWG ID.
     */
    public function getDetails($id)
    {
        // Buscar en la base de datos local
        $game = VideoGame::with(['genres', 'stores', 'platforms'])
            ->where('id', $id)
            ->orWhere('rawg_id', $id)
            ->first();

        if ($game) {
            return response()->json([
                'data' => $game,
            ]);
        }

        return response()->json([
            'error' => 'Game not found',
        ], 404);
    }

    /**
     * Obtener detalles de un juego por su slug.
     */
    public function getDetailsBySlug($slug)
    {
        // Buscar el juego por su slug
        $game = VideoGame::where('slug', $slug)->first();

        if (!$game) {
            return response()->json(['error' => 'Game not found'], 404);
        }

        // Cargar relaciones (géneros, plataformas, etc.)
        $game->load(['genres', 'platforms', 'stores']);

        return response()->json($game);
    }

    /**
     * Obtener los juegos mejor valorados según las reseñas de los usuarios.
     */
    public function getTopGames(Request $request)
    {
        $limit = $request->query('limit', 10);
        if (!is_numeric($limit) || $limit <= 0) {
            return response()->json(["error" => "Invalid limit parameter."], 400);
        }

        // Obtener los juegos con las relaciones de 'genres', 'stores', y 'platforms'
        $topGames = VideoGame::select(
            'video_games.id',
            'video_games.rawg_id',
            'video_games.name',
            'video_games.image_url',
            'video_games.release_date',
            'video_games.slug'
        )
            ->join('reviews', 'video_games.id', '=', 'reviews.game_id')
            ->selectRaw('AVG(reviews.star_rating) as average_rating')
            ->groupBy('video_games.id', 'video_games.rawg_id', 'video_games.name', 'video_games.image_url', 'video_games.release_date', 'video_games.slug')
            ->orderByDesc('average_rating')
            ->take($limit)
            ->with(['genres', 'stores', 'platforms']) // Cargar las relaciones aquí
            ->get();

        // No results
        if ($topGames->isEmpty()) {
            return response()->json(["error" => "No top-rated games found"], 404);
        }

        // Less results than requested
        if ($topGames->count() < $limit) {
            return response()->json([
                "message" => "Returned fewer results than requested. Only found {$topGames->count()} top-rated games.",
                "data" => $topGames
            ]);
        }

        return response()->json($topGames);
    }
    public function gamesPage()
    {
        // Get all platforms, genres, and stores from the database
        $platforms = Platform::all();
        $genres = Genre::all();
        $stores = Store::all();

        return view('app');
    }

    /**
     * Obtener todas las plataformas
     */
    public function getPlatforms()
    {
        try {
            $platforms = Platform::select('id', 'name')
                ->get()
                ->map(function ($platform) {
                    return [
                        'id' => $platform->id,
                        'name' => $platform->name,
                        // Eliminamos games_count temporalmente para evitar errores
                    ];
                });

            return response()->json($platforms);
        } catch (\Exception $e) {
            Log::error('Error fetching platforms: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }

    /**
     * Obtener todos los géneros
     */
    public function getGenres()
    {
        try {
            $genres = Genre::select('id', 'name')
                ->get()
                ->map(function ($genre) {
                    return [
                        'id' => $genre->id,
                        'name' => $genre->name,
                    ];
                });

            return response()->json($genres);
        } catch (\Exception $e) {
            Log::error('Error fetching genres: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }

    /**
     * Obtener todas las tiendas
     */
    public function getStores()
    {
        try {
            $stores = Store::select('id', 'name')
                ->get()
                ->map(function ($store) {
                    return [
                        'id' => $store->id,
                        'name' => $store->name,
                    ];
                });

            return response()->json($stores);
        } catch (\Exception $e) {
            Log::error('Error fetching stores: ' . $e->getMessage());
            return response()->json(['error' => 'Server error'], 500);
        }
    }
    /**
     * Filtrar juegos con soporte para múltiples valores y paginación
     */
    /**
     * Filtrar juegos manteniendo la estructura actual de modelos
     */
    public function filterGames(Request $request)
    {
        try {
            $query = VideoGame::query()->with(['platforms', 'genres', 'stores']);

            // Filtro de búsqueda
            if ($request->has('search') && !empty($request->search)) {
                $searchTerms = explode(' ', $request->search);

                $query->where(function ($q) use ($searchTerms) {
                    foreach ($searchTerms as $term) {
                        $q->where('name', 'like', "%{$term}%");
                    }
                });
            }

            // Filtro de géneros (seguro para la estructura actual)
            if ($request->has('genres')) {
                $genreIds = is_array($request->genres)
                    ? $request->genres
                    : explode(',', $request->genres);

                $query->whereHas('genres', function ($q) use ($genreIds) {
                    $q->whereIn('id', $genreIds);
                });
            }

            // Filtro de plataformas (seguro para la estructura actual)
            if ($request->has('platforms')) {
                $platformIds = is_array($request->platforms)
                    ? $request->platforms
                    : explode(',', $request->platforms);

                $query->whereHas('platforms', function ($q) use ($platformIds) {
                    $q->whereIn('id', $platformIds);
                });
            }

            // Filtro de tiendas (seguro para la estructura actual)
            if ($request->has('stores')) {
                $storeIds = is_array($request->stores)
                    ? $request->stores
                    : explode(',', $request->stores);

                $query->whereHas('stores', function ($q) use ($storeIds) {
                    $q->whereIn('id', $storeIds);
                });
            }

            // Ordenación segura
            $sort = $request->input('sort', 'name');
            $direction = $request->input('direction', 'asc');

            // Solo permitir ordenar por campos existentes en video_games
            $allowedSorts = ['name', 'release_date', 'metacritic_score'];
            if (in_array($sort, $allowedSorts)) {
                $query->orderBy($sort, $direction);
            }

            // Paginación básica
            $perPage = min($request->input('per_page', 12), 50); // Limitar máximo 50 por página
            $page = $request->input('page', 1);

            $results = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'games' => $results->items(),
                'total' => $results->total(),
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error filtering games: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error al filtrar juegos',
                'details' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
    }
}
