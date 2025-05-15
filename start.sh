#!/bin/bash
set -e

echo "🚀 Iniciando aplicación en Railway..."

# Limpiar caché
php artisan optimize:clear

# Generar clave de aplicación si no existe
if [ -z "$APP_KEY" ]; then
  echo "⚠️ No se encontró APP_KEY, generando una nueva..."
  php artisan key:generate --force
else
  echo "✅ APP_KEY encontrada"
fi

# Ejecutar migraciones
echo "🔄 Ejecutando migraciones..."
php artisan migrate --force

# Ejecutar seeders si es necesario (opcional)
# php artisan db:seed --force

# Optimizar la aplicación
echo "⚙️ Optimizando la aplicación..."
php artisan optimize
php artisan view:cache
php artisan route:cache
php artisan config:cache

# Iniciar worker para colas en segundo plano (ya que usas QUEUE_CONNECTION=database)
echo "👷 Iniciando worker para colas..."
php artisan queue:work --daemon --tries=3 --timeout=90 &

# Iniciar el servidor en el puerto asignado por Railway
echo "🌐 Iniciando servidor web en puerto ${PORT:-8000}..."
php artisan serve --host=0.0.0.0 --port=${PORT:-8000}