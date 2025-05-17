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
        Schema::table('reviews', function (Blueprint $table) {
            // Eliminar las columnas si existen (por si acaso)
            $table->dropColumn(['created_at', 'updated_at']);

            // Volver a agregarlas correctamente
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropTimestamps();
        });
    }
};
