# ============================================================
# Pincel de Luz — Build estático + Nginx (multi-stage)
# Imagem final: ~25 MB (Alpine).
# ============================================================

# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Instala deps a partir do package.json (cache eficiente)
COPY package.json package-lock.json* bun.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    else npm install --no-audit --no-fund; fi

# Copia código e builda
COPY . .

# Variáveis públicas (Vite injeta no bundle)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_SUPABASE_PROJECT_ID
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PROJECT_ID=$VITE_SUPABASE_PROJECT_ID

RUN npm run build

# ---------- Stage 2: Nginx ----------
FROM nginx:1.27-alpine AS runner

# Configuração otimizada para SPA
COPY docker/nginx.docker.conf /etc/nginx/conf.d/default.conf

# Copia build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
