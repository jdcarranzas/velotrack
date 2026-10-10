# velotrack-gateway

Gateway Spring Cloud (WebFlux) que solo enruta. Sin autenticación ni autorización propia; el header `Authorization` pasa intacto (captura exige HTTP Basic).

## Puertos locales

| Servicio | Puerto |
|---|---|
| gateway | 8080 |
| talentms | 8081 |
| velotrack-captura | 8082 (docker compose publica 127.0.0.1:8082) |

## Rutas

| Path | Destino (env, default) |
|---|---|
| `/api/venues/**`, `/api/teams/**`, `/api/categories/**`, `/api/skaters/**`, `/api/coaches/**` | `TALENTMS_URL` = `http://localhost:8081` |
| `/talentms/actuator/health/**` (StripPrefix=1 → `/actuator/health/**` de talentms) | `TALENTMS_URL` |
| `/captura/actuator/health/**` (StripPrefix=1 → `/actuator/health/**` de captura) | `CAPTURA_URL` |
| `/api/v1/**` (sessions, athletes/{id}/sessions, agenda) | `CAPTURA_URL` = `http://localhost:8082` |

## Ejecutar

```
mvn spring-boot:run
curl http://localhost:8080/actuator/gateway/routes
```
