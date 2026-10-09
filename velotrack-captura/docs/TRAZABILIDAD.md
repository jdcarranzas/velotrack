# Alcance y trazabilidad

Fuentes locales revisadas: Entrega 1 - Analisis requerimientos (corregido)_1.docx; delivery2-team-E.pdf (Entrega 2); Entrega 3 - atributos de calidad.pdf. Los Word de Entrega 2 y 3 estaban bloqueados para lectura; se usaron sus versiones PDF disponibles.

## Historias implementadas

| Historia / criterio | Implementación | Verificación |
|---|---|---|
| HU03: velocidad de salida, máxima y media | technical.startSpeedKmh, maxSpeedKmh, averageSpeedKmh | Validación de rangos y coherencia |
| HU03: vueltas y tiempos positivos | completedLaps y laps[].timeSeconds | SessionRulesTest y SessionApiIT |
| HU03: parciales e intervalos | laps[].splitSeconds y intervals[] | Parciales positivos; suma no mayor que la vuelta; intervalos ordenados sin superposición |
| HU03: asociación a atleta, fecha y entrenador | athleteId y sessionDate del cuerpo; coachId y teamId de configuración autenticada | Lectura después de persistencia |
| HU03: borrador y completar después | BORRADOR → COMPLETADA mediante PUT | Prueba integrada de transición y cambio de fecha |
| HU03: agenda del entrenador y equipo | PROGRAMADA y GET /agenda?team=false o true | Agenda excluye borradores |
| HU04: resistencia y recuperación | physical.resistanceScore y recoverySeconds | Límites, almacenamiento y lectura |
| HU04: vínculo con sesión e historial | session_metrics enlazada a training_session | GET sesión e historial por atleta |
| HU05: texto opcional hasta 2000 caracteres | observations en POST, PUT y PATCH | Límites, edición y limpieza con null |
| HU05: edición con permisos | HTTP Basic y lista de atletas autorizados | 401 y 403; rechazo de consulta y edición fuera de alcance |

## Decisiones para mantenerlo sencillo

- Un microservicio Java 21 / Spring Boot 4.0.8, tres capas: controlador, servicio, repositorio JDBC.
- Una sola BD TimescaleDB 2.23.1 sobre PostgreSQL 17, propiedad exclusiva de Captura.
- Los metadatos, estado y observaciones se guardan en training_session. Las mediciones numéricas están en la hypertable session_metrics, particionada por measured_at en intervalos de un mes. Cada sesión es un punto temporal; vueltas, parciales e intervalos se conservan como JSONB en ese punto.
- El índice temporal y las consultas por atleta y fechas permiten recuperar el histórico. No se implementan dashboards ni cálculos derivados de HU06-HU08.
- Escritura síncrona y transaccional. Solo se devuelve éxito después de confirmar persistencia. Se omiten el buffer de ingestión y el bus de eventos de las entregas 2 y 3.
- HTTP Basic con contraseña configurable y lista de atletas sustituye a Identidad/Talento para un entrenador y un equipo. El cliente no puede elegir coachId ni teamId. La agenda de equipo se limita a los atletas autorizados; con un entrenador coincide con su agenda.
- Las escalas físicas y límites no estaban especificados numéricamente en las fuentes: resistencia subjetiva 0–10 y recuperación 0–3600 s son supuestos funcionales del prototipo, no criterios médicos. Velocidades 0–150 km/h; tiempos de vuelta >0 y hasta 86400 s.
- Una sesión completada requiere velocidad de salida, al menos una vuelta y un tiempo por vuelta. Máxima, media, parciales, intervalos, indicadores y observaciones son opcionales. Los valores proporcionados siempre se validan, incluso en borradores.
- Los parciales son duraciones de segmentos; pueden ser incompletos, pero su suma no supera el tiempo de la vuelta. Los intervalos son segundos relativos al inicio de sesión y no se superponen.
- PUT reemplaza los campos editables, conserva atleta/equipo/entrenador creador y exige version. PATCH cambia solo observaciones. Un conflicto devuelve 409.
- Las fechas incluyen zona horaria y se almacenan en UTC. Consultas con límite máximo de 100 sesiones, offset y rango [from,to).
- El despliegue AWS usa EC2 + Compose con SSM. EBS cifrado, puertos sin exposición pública y volúmenes persistentes.
- La conexión app–BD usa PostgreSQL 5432 en la red Docker, en lugar del conector HTTP/line protocol 8086 del diseño original. TimescaleDB permite conservar la naturaleza temporal y actualizar borradores/observaciones con transacciones SQL.

## Atributos de calidad y límites

| Entrega 3 | Aplicación en el prototipo | Pendiente para producción |
|---|---|---|
| QA-1 escalabilidad | API sin sesión HTTP; consultas acotadas; pool de 5 conexiones | Cola, autoscaling, balanceo y prueba 10x |
| QA-2 disponibilidad | Health/readiness con BD, reinicio de contenedores, EBS persistente | Multi-AZ, failover, backups automáticos y validación de RTO/RPO |
| QA-3 seguridad | Autenticación, permiso por atleta/equipo, SSM y EBS cifrado | IAM de aplicación, JWT, consentimientos, multi-tenant, WAF y auditoría durable |
| QA-4 offline | Versionado optimista devuelve 409 ante edición obsoleta | Cliente offline y coordinador de sincronización |
| QA-5 costos | Una VM y una BD, sin infraestructura distribuida | Medir costos, archivo frío y políticas de retención |
| QA-6 rendimiento | Validación inmediata y transacción corta | Cronómetro local, escritura asíncrona y medición de latencias p95 |

No se afirma cumplimiento de los SLO de los entregables. No se implementan Kafka, Redis, Kubernetes, CQRS, Saga ni otros microservicios. Los logs de operaciones no equivalen a Auditoría y Cumplimiento. No hay retención destructiva: el histórico permanece hasta una eliminación administrativa de la BD.
