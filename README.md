# GameShelf

**[English Version](#english-version) | [Versión en Español](#versión-en-español)**

---

## 📌 English Version

### Description

GameShelf is a web application designed for video game enthusiasts to track their gaming progress, create personalized lists, write reviews, and discover new games. Inspired by platforms like Letterboxd and Goodreads, GameShelf offers a user-friendly interface with social features, game discovery, and personalized statistics.

---

## 🎥 DEMO

### 🌗 Main Interface: Landing Page + Dark/Light Mode

> Includes a dark/light mode toggle and interactive card-based design with hover effects for browsing games.  
> ![Landing and responsive design](https://i.imgur.com/tHTx7cb.gif)

### 🔍 Real-Time Game Search

> Search games instantly, uses the RAWG API to deliver info about 500,000+ games.  
> ![Game search in action](https://i.imgur.com/LrCKK8X.gif)

### 🎮 Game Page: Add to Lists + Review System

> Detailed game view showing game info, user lists, and a built-in review system with star ratings. Easily add games to custom lists and submit your own reviews.  
> ![Game details, user lists, and review submission](https://i.imgur.com/iIHfZd1.gif)

### 👤 User Profile + Personalized Stats

> Personalized user profile with detailed stats, favorite games, custom lists, and profile customization options.  
> ![User profile with statistics and custom lists](https://i.imgur.com/U4RLM7x.gif)

---

### 🚀 Technologies Used

-   **Frontend:** React, Tailwind CSS, Vite
-   **Backend:** Laravel (PHP)
-   **Database:** MySQL
-   **API Integration:** RAWG.io API for game data
-   **Authentication:** Laravel Sanctum
-   **Deployment:** GitHub (future plans for Railway)

### 🔥 Key Features

-   **User Authentication:** Register, login, and manage user profiles.
-   **Game Reviews:** Rate games (1–5 stars) and write detailed reviews.
-   **Game Lists:** Create, edit, and delete custom lists (e.g., "Favorites," "Played").
-   **Game Discovery:** Search for games locally or via the RAWG API (results are cached in the database).
-   **User Statistics:** View favorite games, genres, and review history.
-   **Responsive Design:** Dark/light theme toggle and mobile-friendly UI.

### 🛠 Quick Start Guide

**To run the project locally, follow these steps:**

#### 1. Set Up the Database:

-   Open PHPMyAdmin (run XAMPP if needed).
-   Create a new database named `gameshelf_db`.
-   Import the SQL script from the `gameshelf_db_backup.sql` file.

**2. Set Up the Project:**

-   Open the project in Visual Studio Code.
-   Open a terminal and run:
    -   `composer install`

**3. Install Frontend Dependencies:**

-   `npm install`

**4. Start the Backend Server:**

-   `php artisan serve`

**5. Start the Frontend Development Server:**

-   Open another terminal and run:
    -   `npm run dev`

**6. Access the Application:**

-   Open your browser and go to:  
    `http://localhost:8000`

### 📂 Project Structure

-   Backend: Laravel MVC architecture with controllers, models, and migrations.
-   Frontend: React components with Tailwind CSS for styling.
-   API Integration: RAWG API for fetching game data (cached in the database).

---

## 📌 Versión en Español

### Descripción

GameShelf es una aplicación web diseñada para entusiastas de los videojuegos, permitiéndoles seguir su progreso, crear listas personalizadas, escribir reseñas y descubrir nuevos juegos. Inspirada en plataformas como Letterboxd y Goodreads, GameShelf ofrece una interfaz intuitiva con funciones sociales, descubrimiento de juegos y estadísticas personalizadas.

---

## 🎥 DEMOSTRACIÓN

### 🌗 Interfaz Principal: Página de Inicio + Modo Claro/Oscuro

> Una vista rápida de la página de inicio con un diseño limpio y responsivo. Incluye cambio entre modo claro/oscuro y tarjetas interactivas.  
> ![Diseño landing y responsivo](https://i.imgur.com/tHTx7cb.gif)

### 🔍 Búsqueda en Tiempo Real

> Búsqueda de juegos mediante la API de RAWG. Los resultados se almacenan en la base de datos para un acceso más rápido.  
> ![Búsqueda de juegos en acción](https://i.imgur.com/LrCKK8X.gif)

### 🎮 Página de Juego: Añadir a Listas + Sistema de Reseñas

> Vista detallada de un juego con su información, opciones para añadirlo a listas y sistema de reseñas con puntuación por estrellas.  
> ![Detalles de juego, listas y reseñas](https://i.imgur.com/iIHfZd1.gif)

### 👤 Perfil de Usuario + Estadísticas

> Perfil personalizado con estadísticas de juegos, favoritos, listas personalizadas y personalización del diseño.  
> ![Perfil de usuario con estadísticas](https://i.imgur.com/U4RLM7x.gif)

---

### 🚀 Tecnologías Utilizadas

-   **Frontend:** React, Tailwind CSS, Vite
-   **Backend:** Laravel (PHP)
-   **Base de datos:** MySQL
-   **Integración de API:** RAWG.io para datos de juegos
-   **Autenticación:** Laravel Sanctum
-   **Despliegue:** GitHub (planes futuros para Railway)

### 🔥 Funcionalidades Principales

-   **Autenticación de usuarios:** Registro, inicio de sesión y gestión de perfiles.
-   **Reseñas de juegos:** Valorar juegos (1–5 estrellas) y escribir reseñas detalladas.
-   **Listas de juegos:** Crear, editar y eliminar listas personalizadas (ej. "Favoritos", "Jugados").
-   **Descubrimiento de juegos:** Buscar juegos localmente o mediante la API de RAWG (los resultados se guardan en la base de datos).
-   **Estadísticas de usuario:** Ver juegos favoritos, géneros más jugados e historial de reseñas.
-   **Diseño responsive:** Tema claro/oscuro y diseño adaptable a móviles.

### 🛠 Guía de Inicio Rápido

**Para ejecutar el proyecto localmente, sigue estos pasos:**

#### 1. Configurar la base de datos:

-   Abre PHPMyAdmin (ejecuta XAMPP si es necesario).
-   Crea una nueva base de datos llamada `gameshelf_db`.
-   Importa el script SQL de la carpeta `gameshelf_db_backup.sql`.

**2. Configurar el proyecto:**

-   Abre el proyecto en Visual Studio Code.
-   Abre una nueva terminal y ejecuta:
    -   `composer install`

**3. Instalar dependencias del frontend:**

-   `npm install`

**4. Iniciar el servidor backend:**

-   `php artisan serve`

**5. Iniciar el servidor de desarrollo del frontend:**

-   Abre otra terminal y ejecuta:
    -   `npm run dev`

**6. Acceder a la aplicación:**

-   Abre tu navegador y visita:  
    `http://localhost:8000`

### 📂 Estructura del Proyecto

-   Backend: Arquitectura MVC con Laravel (controladores, modelos y migraciones).
-   Frontend: Componentes React con Tailwind CSS para estilos.
-   Integración de API: RAWG API para obtener datos de juegos (guardados en la base de datos).
