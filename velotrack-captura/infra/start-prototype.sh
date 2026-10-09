#!/usr/bin/env bash
# Ejecutar como root dentro de /opt/velotrack, despuÃ©s de extraer el proyecto.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  umask 077
  {
    printf 'DB_PASSWORD=%s\n' "$(openssl rand -hex 24)"
    printf 'CAPTURE_PASSWORD=%s\n' "$(openssl rand -hex 24)"
    printf 'CAPTURE_USERNAME=entrenador\n'
    printf 'COACH_ID=11111111-1111-1111-1111-111111111111\n'
    printf 'TEAM_ID=22222222-2222-2222-2222-222222222222\n'
    printf 'ATHLETE_IDS=33333333-3333-3333-3333-333333333333,44444444-4444-4444-4444-444444444444\n'
  } > .env
fi
docker compose up -d --build --wait --wait-timeout 180
printf 'Prototipo iniciado. Las credenciales estÃ¡n en %s/.env\n' "$PWD"
