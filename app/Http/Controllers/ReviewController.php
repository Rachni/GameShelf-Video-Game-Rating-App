<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\ReviewLike;
use Illuminate\Http\Request;
use App\Models\VideoGame;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    /**
     * Store a newly created review in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'game_id' => 'required|exists:video_games,id',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'nullable|string'
        ]);

        try {
            // Verificar si el usuario ya hizo una reseña del juego
            $existingReview = Review::where('user_id', Auth::id())
                ->where('game_id', $request->game_id)
                ->first();

            if ($existingReview) {
                // Actualizar reseña existente usando update() para que actualice el timestamp
                $existingReview->update([
                    'star_rating' => $request->rating,
                    'text' => $request->content
                ]);

                return response()->json($this->formatReview($existingReview));
            }

            // Crear nueva reseña usando create() para que establezca los timestamps
            $review = Review::create([
                'user_id' => Auth::id(),
                'game_id' => $request->game_id,
                'star_rating' => $request->rating,
                'text' => $request->content,
                'created_at' => now(),
                'updated_at' => now()

            ]);

            return response()->json($this->formatReview($review));
        } catch (\Throwable $e) {
            Log::error('Error en store: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Rate a game (quick rating without text).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function rateGame(Request $request)
    {
        Log::info('RateGame request received', [
            'user_id' => Auth::id(),
            'request_data' => $request->all(),
            'token' => $request->bearerToken()
        ]);

        // Validación mejorada que acepta ambos nombres de campo
        $validated = $request->validate([
            'game_id' => 'required|exists:video_games,id',
            'rating' => 'required|integer|min:1|max:5',
            'text' => 'nullable|string',
            'content' => 'nullable|string'
        ]);

        // Combinar los campos text y content
        $content = $request->input('text', $request->input('content', ''));

        try {
            // Verificar autenticación explícitamente
            if (!Auth::check()) {
                Log::warning('Unauthorized attempt to rate game');
                return response()->json(['error' => 'Unauthorized'], 401);
            }

            // Verificar si el usuario ya hizo una reseña del juego
            $existingReview = Review::where('user_id', Auth::id())
                ->where('game_id', $validated['game_id'])
                ->first();

            if ($existingReview) {
                // Actualizar reseña existente
                $existingReview->star_rating = $validated['rating'];
                $existingReview->text = $content;
                $existingReview->save();

                Log::info('Review updated', ['review_id' => $existingReview->id]);
                return response()->json($this->formatReview($existingReview));
            }

            // Crear nueva reseña
            $review = new Review();
            $review->user_id = Auth::id();
            $review->game_id = $validated['game_id'];
            $review->star_rating = $validated['rating'];
            $review->text = $content;
            $review->save();

            Log::info('New review created', ['review_id' => $review->id]);
            return response()->json($this->formatReview($review));
        } catch (\Throwable $e) {
            Log::error('Error in rateGame: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id()
            ]);
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle like on a review.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function toggleLike($id)
    {
        $review = Review::findOrFail($id);

        $existingLike = ReviewLike::where('user_id', Auth::id())
            ->where('review_id', $id)
            ->first();

        if ($existingLike) {
            // Unlike
            $existingLike->delete();
        } else {
            // Like
            $like = new ReviewLike();
            $like->user_id = Auth::id();
            $like->review_id = $id;
            $like->save();
        }

        // Get updated likes count
        $likesCount = ReviewLike::where('review_id', $id)->count();
        $userHasLiked = ReviewLike::where('review_id', $id)
            ->where('user_id', Auth::id())
            ->exists();

        return response()->json([
            'likes_count' => $likesCount,
            'user_has_liked' => $userHasLiked
        ]);
    }

    /**
     * Get reviews for a specific game.
     *
     * @param  int  $gameId
     * @return \Illuminate\Http\Response
     */
    public function getGameReviews($gameId)
    {
        $reviews = Review::with('user')
            ->where('game_id', $gameId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($review) {
                return $this->formatReview($review);
            });

        return response()->json($reviews);
    }

    /**
     * Format review data with additional information.
     *
     * @param  \App\Models\Review  $review
     * @return array
     */
    private function formatReview($review)
    {
        $likesCount = ReviewLike::where('review_id', $review->id)->count();
        $userHasLiked = Auth::check() ? ReviewLike::where('review_id', $review->id)
            ->where('user_id', Auth::id())
            ->exists() : false;

        return [
            'id' => $review->id,
            'user_id' => $review->user_id,
            'game_id' => $review->game_id,
            'rating' => $review->star_rating,
            'content' => $review->text,
            'text' => $review->text, // Para compatibilidad con frontend
            'created_at' => $review->created_at?->toDateTimeString(),
            'updated_at' => $review->updated_at?->toDateTimeString(),
            'user' => $review->user,
            'likes_count' => $likesCount,
            'user_has_liked' => $userHasLiked
        ];
    }

    public function getRecentReviews()
    {
        // Obtener las últimas 10 reseñas con texto no vacío, ordenadas por id PROXIMAMENTE FECHA
        $reviews = Review::with(['user:id,name,profile_pic', 'game:id,name,slug,image_url'])
            ->whereNotNull('text') 
            ->where('text', '<>', '')
            ->orderBy('id', 'desc')
            ->limit(10)
            ->get();

        // Formatear la respuesta
        $formattedReviews = $reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'text' => $review->text,
                'star_rating' => $review->star_rating,
                'created_at' => $review->created_at,
                'likes' => $review->likes,
                'user' => [
                    'id' => $review->user->id,
                    'name' => $review->user->name,
                    'profile_pic' => $review->user->profile_pic,
                ],
                'game' => [
                    'id' => $review->game->id,
                    'name' => $review->game->name,
                    'slug' => $review->game->slug,
                    'image_url' => $review->game->image_url,
                ],
            ];
        });

        return response()->json($formattedReviews);
    }

    public function getReviewsBySlug($slug)
    {
        // Obtener el juego por su slug
        $game = VideoGame::where('slug', $slug)->firstOrFail();

        // Obtener las reseñas del juego con la información del usuario
        $reviews = $game->reviews()
            ->with('user:id,name,profile_pic') // Cargar solo los campos necesarios del usuario
            ->get();

        // Formatear la respuesta
        $formattedReviews = $reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'text' => $review->text,
                'star_rating' => $review->star_rating,
                'created_at' => $review->created_at,
                'likes' => $review->likes,
                'user' => [
                    'id' => $review->user->id,
                    'name' => $review->user->name,
                    'profile_pic' => $review->user->profile_pic, // Usar profile_pic en lugar de avatar
                ],
                'game' => [ // Información del juego
                    'id' => $review->game->id,
                    'name' => $review->game->name,
                    'slug' => $review->game->slug,
                    'image_url' => $review->game->image_url, // Incluir la URL de la imagen del juego
                ],
            ];
        });

        return response()->json($formattedReviews);
    }
}
