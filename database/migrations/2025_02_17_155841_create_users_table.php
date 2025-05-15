<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();  // ID de tipo BIGINT auto_increment
            $table->string('name', 100)->unique();  // Nombre del usuario
            $table->string('email', 100)->unique();  // Email único
            $table->string('password');  // Contraseña
            $table->string('profile_pic')->nullable();  // Foto de perfil
            $table->text('bio')->nullable();  // Biografía
            $table->rememberToken();  // Token para recordar sesión "remember me? yes/no"
            $table->timestamps();  // crea "created_at" and "updated_at"
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
