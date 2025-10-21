#!/bin/sh
set -e

echo "Configuration de l'application..."

# Utilise 'sed' pour remplacer le placeholder par la VRAIE clé API
# L'utilisation de '#' comme délimiteur évite les conflits si la clé contient des '/'
sed "s#GEMINI_API_KEY_PLACEHOLDER#${GEMINI_API_KEY}#g" /usr/share/nginx/html/main.js.template > /usr/share/nginx/html/main.js

echo "Configuration terminée. Démarrage du serveur web..."

# 'exec "$@"' exécute la commande CMD définie dans le Dockerfile (nginx)
exec "$@"