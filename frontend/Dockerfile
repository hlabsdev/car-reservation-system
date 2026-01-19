FROM node:20-alpine

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer TOUTES les dépendances (y compris rollup)
RUN npm install

# Exposer le port
EXPOSE 5173

# Lancer en mode dev
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]