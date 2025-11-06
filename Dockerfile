# Étape 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de configuration
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY src ./src

# Générer le client Prisma
RUN npx prisma generate

# Compiler TypeScript
RUN npm run build

# Étape 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copier package.json pour installer les dépendances
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Installer les dépendances de production
RUN npm ci --only=production

# Copier les fichiers compilés depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copier Prisma CLI depuis le builder pour les migrations (npx le trouvera dans node_modules)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Exposer le port
EXPOSE 3000

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Script de démarrage qui exécute les migrations puis démarre le serveur
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

