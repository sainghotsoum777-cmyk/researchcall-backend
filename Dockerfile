# ─────────────────────────────────────────────────────────
# Dockerfile — ResearchCall API
# Multi-stage build pour une image légère
# ─────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copier le code source
COPY tsconfig.json ./
COPY src/ ./src/

# Générer le client Prisma
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# Compiler TypeScript
RUN npm run build

# ── Stage 2: Production ──────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Copier les dépendances de production
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copier le build et Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY src/prisma/schema.prisma ./src/prisma/schema.prisma

# Créer le dossier uploads
RUN mkdir -p uploads && chown -R appuser:appgroup uploads

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Utiliser l'utilisateur non-root
USER appuser

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Démarrer avec dumb-init pour une gestion propre des signaux
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
