# backend/entrypoint.sh
#!/bin/bash

echo "🔄 Attente de la base de données..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "✅ Base de données prête"

echo "🔄 Migrations..."
python manage.py migrate --noinput

echo "🔄 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

echo "✅ Démarrage du serveur..."
exec python manage.py runserver 0.0.0.0:8000