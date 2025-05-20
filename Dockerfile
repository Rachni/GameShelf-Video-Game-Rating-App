FROM php:8.2-apache

# 1. Instalar dependencias del sistema y Node.js
RUN apt-get update && \
    apt-get install -y \
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev \
    curl gnupg ca-certificates libpq-dev libicu-dev \
    libfreetype6-dev libjpeg62-turbo-dev libwebp-dev \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar extensiones PHP (con todas las dependencias necesarias)
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
    pdo pdo_mysql pdo_pgsql zip mbstring exif pcntl bcmath gd intl \
    && a2enmod rewrite

# 3. Configuración del workspace
WORKDIR /var/www/html

# 4. Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Copiar archivos y configurar permisos
COPY . .
RUN chown -R www-data:www-data storage bootstrap/cache

# 6. Instalar dependencias y construir assets
RUN composer install --no-dev --optimize-autoloader \
    && npm install \
    && npm run build

EXPOSE 80
CMD ["apache2-foreground"]