# GameShelf

**[English Version](#english-version) | [Versión en Español](#versión-en-español)**

---

## 📌 English Version

### Description
GameShelf is a web application designed for video game enthusiasts to track their gaming progress, create personalized lists, write reviews, and discover new games. Inspired by platforms like Letterboxd and Goodreads, GameShelf offers a user-friendly interface with social features, game discovery, and personalized statistics.

### 🚀 Technologies Used
- **Frontend:** React, Tailwind CSS, Vite  
- **Backend:** Laravel (PHP)  
- **Database:** MySQL  
- **API Integration:** RAWG.io API for game data  
- **Authentication:** Laravel Sanctum  
- **Deployment:** GitHub (future plans for Railway)

### 🔥 Key Features
- **User Authentication:** Register, login, and manage user profiles.  
- **Game Reviews:** Rate games (1–5 stars) and write detailed reviews.  
- **Game Lists:** Create, edit, and delete custom lists (e.g., "Favorites," "Played").  
- **Game Discovery:** Search for games locally or via the RAWG API (results are cached in the database).  
- **User Statistics:** View favorite games, genres, and review history.  
- **Responsive Design:** Dark/light theme toggle and mobile-friendly UI.

### 🛠 Quick Start Guide

**To run the project locally, follow these steps:**

#### 1. Set Up the Database:
- Open PHPMyAdmin (run XAMPP if needed).
- Create a new database named `gameshelf_db`.
- Import the SQL script from the `gameshelf_db_backup.sql` file.

**2. Set Up the Project:**
- Open the project in Visual Studio Code.
- Open a terminal and run:
  - composer install

**3. Install Frontend Dependencies:**
- npm install

**4. Start the Backend Server:**
- php artisan serve

**5. Start the Frontend Development Server:**
- Open another terminal and run:
  - npm run dev

**6. Access the Application:**
- Open your browser and go to:
  - http://localhost:8000

### 📂 Project Structure
- Backend: Laravel MVC architecture with controllers, models, and migrations.  
- Frontend: React components with Tailwind CSS for styling.  
- API Integration: RAWG API for fetching game data (cached in the database).

### 📌 GitHub Project Description
GameShelf is a video game review and tracking web app built with Laravel (PHP) and React. It allows users to rate games, create lists, and discover new titles. The project showcases modern web development techniques, including API integration, authentication, and responsive design.
---

## 📌 Versión en Español

### Descripción
GameShelf es una aplicación web diseñada para entusiastas de los videojuegos, permitiéndoles seguir su progreso, crear listas personalizadas, escribir reseñas y descubrir nuevos juegos. Inspirada en plataformas como Letterboxd y Goodreads, GameShelf ofrece una interfaz intuitiva con funciones sociales, descubrimiento de juegos y estadísticas personalizadas.

### 🚀 Tecnologías Utilizadas
- Frontend: React, Tailwind CSS, Vite  
- Backend: Laravel (PHP)  
- Base de datos: MySQL  
- Integración de API: RAWG.io para datos de juegos  
- Autenticación: Laravel Sanctum  
- Despliegue: GitHub (planes futuros para Railway)

### 🔥 Funcionalidades Principales
- Autenticación de usuarios: Registro, inicio de sesión y gestión de perfiles.  
- Reseñas de juegos: Valorar juegos (1–5 estrellas) y escribir reseñas detalladas.  
- Listas de juegos: Crear, editar y eliminar listas personalizadas (ej. "Favoritos", "Jugados").  
- Descubrimiento de juegos: Buscar juegos localmente o mediante la API de RAWG (los resultados se guardan en la base de datos).  
- Estadísticas de usuario: Ver juegos favoritos, géneros más jugados e historial de reseñas.  
- Diseño responsive: Tema claro/oscuro y diseño adaptable a móviles.

### 🛠 Guía de Inicio Rápido

Para ejecutar el proyecto localmente, sigue estos pasos:

**1. Configurar la base de datos:**
- Abre PHPMyAdmin (ejecuta XAMPP si es necesario).
- Crea una nueva base de datos llamada `gameshelf_db`.
- Importa el script SQL de la carpeta `script para importar`.

**2. Configurar el proyecto:**
- Abre el proyecto en Visual Studio Code.
- Abre una nueva terminal y ejecuta:
  - composer install

**3. Instalar dependencias del frontend:**
- npm install

**4. Iniciar el servidor backend:**
- php artisan serve

**5. Iniciar el servidor de desarrollo del frontend:**
- Abre otra terminal y ejecuta:
  - npm run dev

**6. Acceder a la aplicación:**
- Abre tu navegador y visita:
  - http://localhost:8000

### 📂 Estructura del Proyecto
- Backend: Arquitectura MVC con Laravel (controladores, modelos y migraciones).  
- Frontend: Componentes React con Tailwind CSS para estilos.  
- Integración de API: RAWG API para obtener datos de juegos (guardados en la base de datos).
