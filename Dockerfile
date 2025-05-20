# 1. Base PHP 8.2 con Apache
FROM php:8.2-apache

# 2. Instalar dependencias y extensiones necesarias
RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev curl curl gnupg && \
    docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath gd && \
    a2enmod rewrite

# 3. Instalar NodeJS LTS (v18)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs npm

# 4. Establecer directorio de trabajo
WORKDIR /var/www/html

# 5. Copiar todo el código (asegúrate de usar .dockerignore para node_modules, vendor, .git, etc)
COPY . .

# 6. Cambiar DocumentRoot para que Apache sirva Laravel desde /public
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# 7. Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# 8. Instalar dependencias PHP sin dev y optimizadas
RUN composer install --no-dev --optimize-autoloader

# 9. Instalar dependencias JS y construir frontend
RUN npm install
RUN npm run build

# 10. Ajustar permisos para Laravel (storage, cache y assets de build)
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public/build

# 11. Exponer puerto 80
EXPOSE 80

# 12. Arrancar Apache en primer plano
CMD ["apache2-foreground"]
