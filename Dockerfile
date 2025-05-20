# Base con PHP y Apache
FROM php:8.2-apache

# Instalar dependencias del sistema + Node.js v18
RUN apt-get update && \
    apt-get install -y \
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs npm && \
    docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath gd && \
    a2enmod rewrite

# Directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos
COPY . .

# Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Instalar dependencias y construir assets
RUN composer install --no-dev --optimize-autoloader && \
    npm install && \
    npm run build && \
    chown -R www-data:www-data storage bootstrap/cache public/build

# Puerto expuesto
EXPOSE 80

# Comando de inicio
CMD ["apache2-foreground"]