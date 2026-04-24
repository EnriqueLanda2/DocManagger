#!/bin/bash
# deploy.sh
# Script para desplegar la última versión en el servidor de producción (Hostinger)

echo "Iniciando despliegue de doc_platform..."

# 1. Actualizar repositorio
echo "Descargando últimos cambios de la rama produccion..."
git pull origin produccion

# 2. Desplegar Frontend (Vite)
echo "Construyendo Frontend..."
cd frontend
npm install
echo "VITE_API_URL=https://koodisoft.com/api" > .env.production
npm run build
echo "Copiando archivos estáticos de Vite a /var/www/html/docM..."
sudo rm -rf /var/www/html/docM
sudo mkdir -p /var/www/html/docM
sudo cp -r dist/* /var/www/html/docM/
cd ..

# 3. Desplegar Backend (Django)
echo "Actualizando Backend..."
cd backend

# Cargar variables de entorno
if [ -f .env.production ]; then
  echo "Cargando configuración desde .env.production..."
  set -a
  source .env.production
  set +a
elif [ -f .env ]; then
  echo "Cargando configuración desde .env..."
  set -a
  source .env
  set +a
fi

if [ ! -d "venv" ]; then
    echo "Creando entorno virtual..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

export DJANGO_SETTINGS_MODULE=doc_platform.settings
python manage.py migrate
python manage.py collectstatic --noinput
cd ..

# 4. Reiniciar servicios
echo "Reiniciando Gunicorn y Nginx..."
sudo systemctl restart gunicorn
sudo systemctl restart nginx

echo "Despliegue finalizado con éxito!"
