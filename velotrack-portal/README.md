# VeloTrack Portal

Portal web de VeloTrack, una plataforma de analítica de desempeño para entrenadores de patinaje de carreras de alto rendimiento. Reemplaza hojas de cálculo y registros manuales: captura métricas técnicas y físicas de cada atleta en las sesiones y las analiza a lo largo de los años.

Los datos vienen de la gateway de VeloTrack (talentms y captura). El navegador llama a `/gateway/*` en el mismo origen y Next reenvía las peticiones, así que no hace falta configurar CORS.

## Requisitos

- Node 20.14 o superior (recomendado: Node 22 LTS). La versión está en `.nvmrc`.
- npm 10.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # opcional: los valores por defecto ya sirven
npm run dev
```

Abre http://localhost:3000.

## Scripts

| Script                                    | Qué hace                       |
| ----------------------------------------- | ------------------------------ |
| `npm run dev`                             | Servidor de desarrollo         |
| `npm run build` / `npm start`             | Build de producción y servidor |
| `npm run lint` / `npm run lint:fix`       | ESLint                         |
| `npm run format` / `npm run format:check` | Prettier                       |
| `npm run typecheck`                       | Comprobación de tipos          |
| `npm test` / `npm run test:watch`         | Tests con Vitest               |

## Variables de entorno

| Variable               | Valor por defecto                                         | Uso                                                                  |
| ---------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| `GATEWAY_URL`          | `https://velotrack-gateway-732809824488.us-east1.run.app` | Gateway a la que Next reenvía `/gateway/*`. Se lee al hacer el build |
| `NEXT_PUBLIC_COACH_ID` | `1`                                                       | Id del entrenador que usa el portal mientras no haya login           |

## Documentación

- [CLAUDE.md](CLAUDE.md): arquitectura, convenciones y comandos.
- [docs/api-contract.md](docs/api-contract.md): endpoints que el portal espera del backend.
- [docs/figma-notes.md](docs/figma-notes.md): notas del diseño de Figma.

## Despliegue en Cloud Run

`Dockerfile` arma el servidor standalone de Next y `cloudbuild.yaml` lo construye, lo sube a Artifact Registry (`velotrack`) y lo despliega como el servicio `velotrack-portal` en `us-east1`. Desde la raíz del repositorio:

```bash
gcloud builds submit --config velotrack-portal/cloudbuild.yaml --project <PROJECT_ID> .
```

`GATEWAY_URL` y `NEXT_PUBLIC_COACH_ID` se fijan al construir la imagen (substitutions `_GATEWAY_URL` y `_COACH_ID`); para cambiarlos hay que volver a desplegar.
