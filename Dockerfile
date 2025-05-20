FROM php:8.2-apache

# Instalar dependencias
RUN apt-get update && \
    apt-get install -y \
    libzip-dev libpng-dev libonig-dev libxml2-dev libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip mbstring gd \
    && a2enmod rewrite

WORKDIR /var/www/html
COPY . .

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

# Configurar Laravel
RUN composer install --no-dev --optimize-autoloader && \
    chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80
CMD ["apache2-foreground"]