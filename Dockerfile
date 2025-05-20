# Usamos una imagen base más ligera
FROM php:8.2-apache-bullseye

# Etapa 1: Instalar solo dependencias de PHP
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev \
    libpq-dev libicu-dev libfreetype6-dev libjpeg62-turbo-dev libwebp-dev \
    ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*

# Configurar extensiones PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp && \
    docker-php-ext-install -j$(nproc) \
    pdo pdo_mysql zip mbstring exif pcntl bcmath gd intl && \
    a2enmod rewrite

# Etapa 2: Instalar Node.js desde binarios oficiales (NO usar apt)
RUN curl -fsSL https://nodejs.org/dist/v18.20.2/node-v18.20.2-linux-x64.tar.xz | tar -xJ -C /usr/local --strip-components=1 && \
    npm install -g npm@latest

# Configuración del workspace
WORKDIR /var/www/html

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copiar archivos
COPY . .

# Instalar dependencias y construir
RUN composer install --no-dev --optimize-autoloader --no-interaction && \
    npm install && \
    npm run build && \
    chown -R www-data:www-data storage bootstrap/cache public/build

EXPOSE 80
CMD ["apache2-foreground"]