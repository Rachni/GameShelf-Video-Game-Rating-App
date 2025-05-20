FROM php:8.2-apache

# 1. Instalar dependencias del sistema (sin Node.js primero)
RUN apt-get update && \
    apt-get install -y \
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev \
    libpq-dev libicu-dev libfreetype6-dev libjpeg62-turbo-dev libwebp-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
    pdo pdo_mysql zip mbstring exif pcntl bcmath gd intl \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

# 2. Instalar Node.js desde el repositorio oficial de NodeSource
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# 3. Configurar directorio de trabajo
WORKDIR /var/www/html

# 4. Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 5. Copiar archivos
COPY . .

# 6. Instalar dependencias y construir assets
RUN composer install --no-dev --optimize-autoloader \
    && npm install \
    && npm run build \
    && chown -R www-data:www-data storage bootstrap/cache public/build

EXPOSE 80
CMD ["apache2-foreground"]