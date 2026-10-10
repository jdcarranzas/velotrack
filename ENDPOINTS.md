# Endpoints VeloTrack (vía gateway)

`{{velotrack-gateway}}` = URL base del gateway.

## talentms

### Venues
| Método | Path | Params |
|---|---|---|
| POST | `{{velotrack-gateway}}/api/venues` | body `VenueRequest` |
| GET | `{{velotrack-gateway}}/api/venues` | `organizationId` (opcional), `activeOnly` (default `true`) |
| GET | `{{velotrack-gateway}}/api/venues/{id}` | |
| PUT | `{{velotrack-gateway}}/api/venues/{id}` | body `VenueRequest` |
| PATCH | `{{velotrack-gateway}}/api/venues/{id}/status` | body `StatusUpdateRequest` |

### Teams
| Método | Path | Params |
|---|---|---|
| POST | `{{velotrack-gateway}}/api/teams` | body `TeamRequest` |
| GET | `{{velotrack-gateway}}/api/teams` | `venueId` (opcional), `activeOnly` (default `true`) |
| GET | `{{velotrack-gateway}}/api/teams/{id}` | |
| PUT | `{{velotrack-gateway}}/api/teams/{id}` | body `TeamRequest` |
| PATCH | `{{velotrack-gateway}}/api/teams/{id}/status` | body `StatusUpdateRequest` |

### Categories
| Método | Path | Params |
|---|---|---|
| POST | `{{velotrack-gateway}}/api/categories` | body `CategoryRequest` |
| GET | `{{velotrack-gateway}}/api/categories` | `activeOnly` (default `true`) |
| GET | `{{velotrack-gateway}}/api/categories/{id}` | |
| PUT | `{{velotrack-gateway}}/api/categories/{id}` | body `CategoryRequest` |
| PATCH | `{{velotrack-gateway}}/api/categories/{id}/status` | body `StatusUpdateRequest` |

### Skaters
| Método | Path | Params |
|---|---|---|
| POST | `{{velotrack-gateway}}/api/skaters` | body `SkaterRegistrationRequest` |
| GET | `{{velotrack-gateway}}/api/skaters` | `teamId` (requerido), `coachId` (opcional) |
| GET | `{{velotrack-gateway}}/api/skaters/{teamId}` | `coachId` (opcional) |

### Coaches
| Método | Path | Params |
|---|---|---|
| POST | `{{velotrack-gateway}}/api/coaches` | body `CoachRegistrationRequest` |
| GET | `{{velotrack-gateway}}/api/coaches/{id}` | |
| PUT | `{{velotrack-gateway}}/api/coaches/{id}/teams` | body con equipos |
| GET | `{{velotrack-gateway}}/api/coaches/{id}/access` | |
| GET | `{{velotrack-gateway}}/api/coaches/{id}/access-history` | |

## captura

Requiere HTTP Basic (`entrenador` / `CAPTURE_PASSWORD`). El gateway reenvía el header `Authorization` tal cual.

| Método | Path | Params |
|---|---|---|
| POST | `{{velotrack-gateway}}/api/v1/sessions` | body `SessionRequest` (responde 201 + `Location`) |
| GET | `{{velotrack-gateway}}/api/v1/sessions/{id}` | `id` UUID |
| PUT | `{{velotrack-gateway}}/api/v1/sessions/{id}` | body `SessionRequest` |
| PATCH | `{{velotrack-gateway}}/api/v1/sessions/{id}/observations` | body `{ "version": 0, "observations": "..." }` |
| GET | `{{velotrack-gateway}}/api/v1/athletes/{athleteId}/sessions` | `from`, `to` (ISO instant, requeridos), `limit` (1-100, def. 50), `offset` (0-100000, def. 0) |
| GET | `{{velotrack-gateway}}/api/v1/agenda` | `from`, `to` (requeridos), `team` (def. `false`), `limit`, `offset` |

## Gateway y healthchecks

| Método | Path | Destino |
|---|---|---|
| GET | `{{velotrack-gateway}}/actuator/health` | gateway |
| GET | `{{velotrack-gateway}}/actuator/info` | gateway |
| GET | `{{velotrack-gateway}}/actuator/gateway/routes` | gateway (rutas cargadas) |
| GET | `{{velotrack-gateway}}/talentms/actuator/health` | talentms |
| GET | `{{velotrack-gateway}}/talentms/actuator/health/liveness` | talentms |
| GET | `{{velotrack-gateway}}/talentms/actuator/health/readiness` | talentms |
| GET | `{{velotrack-gateway}}/captura/actuator/health` | captura |
| GET | `{{velotrack-gateway}}/captura/actuator/health/liveness` | captura |
| GET | `{{velotrack-gateway}}/captura/actuator/health/readiness` | captura |

## Notas
- Los endpoints de talentms no tienen autenticación.
- Los campos de los bodies están en `talentms/src/main/java/com/velotrack/talentms/dto/` y en `velotrack-captura/docs/*.json`.
