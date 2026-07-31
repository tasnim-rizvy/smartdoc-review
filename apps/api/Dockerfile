# ─── Builder stage ───────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# No lockfile in the repo (see .gitignore: *-lock.json), so use npm install
COPY package.json ./
COPY apps/api/package.json apps/api/
RUN npm install

COPY . .
RUN npm run build -w apps/api
RUN npm prune --omit=dev

# ─── Runner stage ────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 8000
CMD ["node", "apps/api/dist/index.js"]
