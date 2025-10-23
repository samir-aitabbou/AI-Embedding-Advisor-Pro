#!/bin/bash
set -e

echo "Arrêt des conteneurs existants (s'il y en a)..."
# Arrête et supprime les anciens conteneurs définis dans docker-compose
docker-compose down

echo "Construction de l'image Docker (peut prendre un moment la première fois)..."
# Construit l'image en suivant les instructions du Dockerfile
# docker-compose build
docker-compose build --no-cache

echo "Lancement du conteneur en mode détaché..."
# Lance le conteneur en arrière-plan
docker-compose up -d

echo ""
echo "------------------------------------------------------"
echo "  ✅ AI Embedding Advisor Pro est lancé !"
echo "  Accessible sur : http://localhost:8080"
echo "------------------------------------------------------"
echo ""
echo "Pour voir les logs : docker-compose logs -f"
echo "Pour arrêter :       docker-compose down"