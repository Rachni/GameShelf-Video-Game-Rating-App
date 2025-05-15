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
        Schema::table('video_games', function (Blueprint $table) {
            $table->dropColumn('platforms');
        });
    }
    
    public function down()
    {
        Schema::table('video_games', function (Blueprint $table) {
            $table->text('platforms')->nullable();
        });
    }
};
