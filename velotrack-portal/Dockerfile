# Imagen del portal para Cloud Run (servidor standalone de Next).
# GATEWAY_URL y NEXT_PUBLIC_COACH_ID se fijan al construir: el rewrite de
# /gateway/* y las variables NEXT_PUBLIC_* quedan dentro del build.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
ARG GATEWAY_URL
ARG NEXT_PUBLIC_COACH_ID=1
ENV GATEWAY_URL=$GATEWAY_URL \
    NEXT_PUBLIC_COACH_ID=$NEXT_PUBLIC_COACH_ID \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# public/ está vacío y git no lo versiona
RUN mkdir -p public && npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 8080
CMD ["node", "server.js"]
