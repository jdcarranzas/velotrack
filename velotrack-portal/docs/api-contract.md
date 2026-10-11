# Contrato de API que usa el portal

Endpoints de la gateway de VeloTrack que consume el portal, con los DTOs tal como llegan. La fuente de verdad son los DTOs de `talentms/src/main/java/com/velotrack/talentms/dto/` y `velotrack-captura/src/main/java/co/velotrack/captura/session/`, más lo que responde la gateway desplegada (que a veces va por delante del repo: por ejemplo, `telephone` y `email` de patinadores y entrenadores).

El navegador llama a `/gateway/<ruta>` en el mismo origen y `next.config.ts` lo reenvía a `GATEWAY_URL/<ruta>`. Cada método de `src/services/modules/*` comenta el endpoint que usa.

## Convenciones reales

- JSON en camelCase. Fechas ISO 8601 (`dateOfBirth` sin hora: `"2009-03-14"`).
- **talentms:** ids enteros, sin autenticación, sin paginación. Errores con el formato por defecto de Spring `{ timestamp, status, error, path }`, sin mensaje: el portal pone el texto según el estado.
- **captura:** ids UUID (el del atleta codifica el id del patinador, ver abajo). Hoy responde sin autenticación (el README del servicio habla de HTTP Basic). Errores como `ProblemDetail` `{ title, detail, status, errors?: [{ field, message }] }`; `detail` llega con UTF-8 codificado dos veces y el portal lo repara (`repairDoubleUtf8`).
- **Nada se borra:** sedes, equipos y categorías se desactivan con `PATCH …/status`.
- El portal trabaja los tiempos de vuelta en milisegundos; captura los envía en segundos decimales. `sessionsMapper.ts` hace la conversión.

## talentms

### Sedes · `talentService`

| Método | Ruta                      | Body / query                                                     | Respuesta     |
| ------ | ------------------------- | ---------------------------------------------------------------- | ------------- |
| GET    | `/api/venues`             | `?organizationId&activeOnly` (el portal pide `activeOnly=false`) | `Venue[]`     |
| POST   | `/api/venues`             | `{ name*, description, organizationId* }`                        | `Venue` (201) |
| PUT    | `/api/venues/{id}`        | igual que POST                                                   | `Venue`       |
| PATCH  | `/api/venues/{id}/status` | `{ active* }`                                                    | `Venue`       |

`Venue = { id, name, description, organizationId, isActive }`. No hay endpoint de organizaciones: el formulario propone el `organizationId` de las sedes existentes.

### Equipos

| Método | Ruta                     | Body / query                       | Respuesta    |
| ------ | ------------------------ | ---------------------------------- | ------------ |
| GET    | `/api/teams`             | `?venueId&activeOnly`              | `Team[]`     |
| POST   | `/api/teams`             | `{ name*, description, venueId* }` | `Team` (201) |
| PUT    | `/api/teams/{id}`        | igual que POST                     | `Team`       |
| PATCH  | `/api/teams/{id}/status` | `{ active* }`                      | `Team`       |

`Team = { id, name, description, venueId, isActive }`

### Categorías

| Método | Ruta                          | Body / query             | Respuesta        |
| ------ | ----------------------------- | ------------------------ | ---------------- |
| GET    | `/api/categories`             | `?activeOnly`            | `Category[]`     |
| POST   | `/api/categories`             | `{ name*, description }` | `Category` (201) |
| PUT    | `/api/categories/{id}`        | igual que POST           | `Category`       |
| PATCH  | `/api/categories/{id}/status` | `{ active* }`            | `Category`       |

`Category = { id, name, description, isActive }`

### Patinadores

| Método | Ruta           | Body / query                                                                           | Respuesta      |
| ------ | -------------- | -------------------------------------------------------------------------------------- | -------------- |
| GET    | `/api/skaters` | `?teamId*&coachId` (con `coachId` sin acceso al equipo responde `[]`)                  | `Skater[]`     |
| POST   | `/api/skaters` | `{ name*, idNumber*, dateOfBirth*, categoryId*, teamId*, venueId*, telephone, email }` | `Skater` (201) |

`Skater = { id, name, idNumber, dateOfBirth, categoryId, teamId, venueId, telephone, email, createdAt }`

- No hay `GET /api/skaters/{id}`: `GET /api/skaters/{teamId}` recibe un **equipo**. El perfil busca el patinador entre los de los equipos del entrenador.
- No hay listado global: el portal pide un equipo a la vez (en paralelo) con los `teamIds` del entrenador.
- El controlador no valida el body (`@Valid` ausente): el portal valida con `skaterFormSchema`. Un 400 llega sin mensaje (documento repetido, catálogo inactivo…).
- `telephone` y `email` aparecen en la respuesta desplegada; el portal los envía como opcionales al registrar.
- **No existen** el estado del patinador (Activo/Inactivo/Lesionado) ni la reasignación de equipo que muestra el diseño.

### Entrenadores

| Método | Ruta                               | Body / header                                          | Respuesta            |
| ------ | ---------------------------------- | ------------------------------------------------------ | -------------------- |
| GET    | `/api/coaches/{id}`                |                                                        | `Coach`              |
| POST   | `/api/coaches`                     | `{ name*, email*, password*, telephone, teamIds*[] }`  | `Coach` (201)        |
| PUT    | `/api/coaches/{id}/teams`          | body `number[]` (reemplaza todos); header `X-Admin-Id` | `Coach`              |
| GET    | `/api/coaches/{id}/access`         |                                                        | `CoachAccess`        |
| GET    | `/api/coaches/{id}/access-history` |                                                        | `AccessAuditEntry[]` |

- `Coach = { id, name, email, telephone, status, teamIds }`
- `CoachAccess = { coachId, teamIds, venueIds }`
- `AccessAuditEntry = { id, coachId, teamId, venueId, actionType: "ASSIGNED" | "REMOVED", performedById, changedAt }`
- No hay listado de entrenadores. El entrenador que usa el portal sale de `NEXT_PUBLIC_COACH_ID`; el portal envía ese id en `X-Admin-Id`.

## captura · `sessionsService`

| Método | Ruta                                   | Body / query                                                         | Respuesta                  |
| ------ | -------------------------------------- | -------------------------------------------------------------------- | -------------------------- |
| POST   | `/api/v1/sessions`                     | `SessionRequest`                                                     | `TrainingSession` (201)    |
| GET    | `/api/v1/sessions/{id}`                |                                                                      | `TrainingSession`          |
| PUT    | `/api/v1/sessions/{id}`                | `SessionRequest` con `version*` (reemplaza todo lo editable)         | `TrainingSession`          |
| PATCH  | `/api/v1/sessions/{id}/observations`   | `{ version*, observations }` (`null` las borra)                      | `TrainingSession`          |
| GET    | `/api/v1/athletes/{skaterId}/sessions` | `?from*&to*&limit(1-100, 50)&offset(0-100000, 0)`, rango `[from,to)` | `TrainingSession[]` (desc) |
| GET    | `/api/v1/agenda`                       | `?from*&to*&team(false)&limit&offset`; solo `PROGRAMADA`             | `TrainingSession[]`        |

```ts
SessionRequest = {
  athleteId: UUID* (codifica el id del patinador), sessionDate: Instant*, status: "PROGRAMADA" | "BORRADOR" | "COMPLETADA"*,
  technical?: {
    startSpeedKmh, maxSpeedKmh, averageSpeedKmh,      // 0-150
    completedLaps,                                    // 0-1000
    laps: [{ timeSeconds* (>0, ≤86400), splitSeconds: number[] (≤100) }],
    intervals: [{ fromSecond*, toSecond*, completedLaps* }],
  },
  physical?: { resistanceScore (0-10), recoverySeconds (0-3600) },
  observations?: string (≤2000), version?: number,
}
TrainingSession = SessionRequest + { id, coachId, teamId, version, createdAt, updatedAt }
```

Reglas (`SessionRules`, repetidas en `sessionFormSchema`):

- `COMPLETADA` exige velocidad de salida, `completedLaps > 0` y un tiempo por cada vuelta.
- No puede haber más tiempos que vueltas; salida y media no superan la máxima.
- La suma de parciales no supera su vuelta.
- Intervalos con `from < to`, ordenados, sin superponerse y sin superar las vueltas totales.

Errores: 400 validación (con `errors[]`), 403 atleta fuera del alcance, 404 sesión inexistente, 409 versión obsoleta, 503 base de datos.

**Ids del atleta.** La versión desplegada de captura (más nueva que el código del repo) vincula al patinador de talentms:

- `GET /api/v1/athletes/{skaterId}/sessions` recibe el **id entero del patinador** (un UUID ahí da 400). Si captura no lo conoce responde 404 "Patinador sin equivalencia en captura".
- En los cuerpos, `athleteId` es un UUID que codifica ese id: `00000001-0000-4000-8000-` + el id en decimal con ceros a la izquierda hasta 12 dígitos (patinador 99 → `00000001-0000-4000-8000-000000000099`). `coachId` y `teamId` siguen el mismo esquema con prefijo `00000002` y `00000003`.
- `sessionsMapper` (`toCaptureAthleteId` / `toSkaterId`) hace la conversión: en el portal `athleteId` siempre es el id del patinador, y los formularios lo eligen con un select de los patinadores del entrenador.
- `GET/PUT/PATCH /api/v1/sessions/{id}` responden 403 "Sin permiso sobre este atleta o equipo" para estas sesiones: el alcance de captura todavía no incluye a los patinadores vinculados.
