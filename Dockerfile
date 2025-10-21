# Étape 1: Utiliser une image nginx légère
FROM nginx:1.25-alpine

# Définir le répertoire de travail
WORKDIR /usr/share/nginx/html

# Supprimer les fichiers par défaut d'nginx
RUN rm -rf ./*

# Copier les fichiers statiques de votre dossier src/
COPY src/index.html .
COPY src/style.css .
# On copie le JS en tant que "template" pour le script d'entrypoint
COPY src/main.js main.js.template

# Copier le script d'entrypoint qui injectera la clé API
COPY docker-entrypoint.sh /docker-entrypoint.sh
# Rendre le script exécutable
RUN chmod +x /docker-entrypoint.sh

# Exposer le port 80 (port HTTP standard)
EXPOSE 80

# Définir le script comme point d'entrée
ENTRYPOINT ["/docker-entrypoint.sh"]

# Commande par défaut pour démarrer nginx (sera exécutée par l'entrypoint)
CMD ["nginx", "-g", "daemon off;"]