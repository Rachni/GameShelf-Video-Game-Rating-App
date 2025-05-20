# Etapa 1: Construcción frontend con Node 18
FROM node:18 as node-builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar dependencias Node
RUN npm install

# Copiar todo el código fuente (para build, se asume que el frontend está en el proyecto)
COPY . .

# Construir frontend (ajusta comando según tu package.json)
RUN npm run build


# Etapa 2: Servidor PHP con Apache
FROM php:8.2-apache

# Instalar dependencias necesarias y extensiones PHP
RUN apt-get update && apt-get install -y \
    git unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev curl gnupg && \
    docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath gd && \
    a2enmod rewrite

# Cambiar DocumentRoot para Laravel (usar /public)
RUN sed -i 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf

# Establecer directorio de trabajo
WORKDIR /var/www/html

# Copiar todo el código fuente al contenedor
COPY . .

# Copiar los archivos del build frontend desde la etapa node-builder
COPY --from=node-builder /app/public/build ./public/build

# Instalar Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Instalar dependencias PHP sin dev y optimizadas
RUN composer install --no-dev --optimize-autoloader

# Ajustar permisos para storage, cache y assets
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache /var/www/html/public/build

# Exponer puerto 80
EXPOSE 80

# Arrancar Apache en primer plano
CMD ["apache2-foreground"]
