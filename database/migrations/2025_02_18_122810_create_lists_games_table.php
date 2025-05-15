<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('list_games', function (Blueprint $table) {
            $table->foreignId('list_id')->constrained()->onDelete('cascade');
            $table->foreignId('game_id')->constrained('video_games')->onDelete('cascade');
            $table->primary(['list_id', 'game_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lists_games');
    }
};
