-- Prepara el dataset velotrack para la carga append-only desde Pub/Sub (suscripciones BigQuery).
-- Cada guardado/actualizacion agrega una fila; las vistas *_current dejan la fila vigente por id.
-- Idempotente. Ejecutar con: bq query --use_legacy_sql=false < bigquery-dedup.sql

-- 1) Columnas de versionado. Las filas historicas quedan en NULL y pierden frente a cualquier fila nueva.
ALTER TABLE velotrack.session_metrics ADD COLUMN IF NOT EXISTS session_version INT64;
ALTER TABLE velotrack.categories ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE velotrack.venues ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE velotrack.teams ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE velotrack.skaters ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE velotrack.coaches ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE velotrack.coach_teams ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;
ALTER TABLE velotrack.access_audit_log ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

-- 2) Vistas con la fila vigente.
CREATE OR REPLACE VIEW velotrack.training_session_current AS
SELECT * FROM velotrack.training_session
WHERE TRUE
QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY version DESC, updated_at DESC) = 1;

CREATE OR REPLACE VIEW velotrack.session_metrics_current AS
SELECT * FROM velotrack.session_metrics
WHERE TRUE
QUALIFY ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY session_version DESC, measured_at DESC) = 1;

CREATE OR REPLACE VIEW velotrack.categories_current AS
SELECT * FROM velotrack.categories
WHERE TRUE
QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY published_at DESC) = 1;

CREATE OR REPLACE VIEW velotrack.venues_current AS
SELECT * FROM velotrack.venues
WHERE TRUE
QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY published_at DESC) = 1;

CREATE OR REPLACE VIEW velotrack.teams_current AS
SELECT * FROM velotrack.teams
WHERE TRUE
QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY published_at DESC) = 1;

CREATE OR REPLACE VIEW velotrack.skaters_current AS
SELECT * FROM velotrack.skaters
WHERE TRUE
QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY published_at DESC) = 1;

CREATE OR REPLACE VIEW velotrack.coaches_current AS
SELECT * FROM velotrack.coaches
WHERE TRUE
QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY published_at DESC) = 1;

-- talentms publica el conjunto completo de equipos del entrenador con el mismo published_at.
CREATE OR REPLACE VIEW velotrack.coach_teams_current AS
SELECT * FROM velotrack.coach_teams
WHERE TRUE
QUALIFY published_at IS NOT DISTINCT FROM MAX(published_at) OVER (PARTITION BY coach_id);

-- 3) Vistas existentes que leen tablas crudas: apuntan a las *_current.
--    Solo cambian los nombres de tabla; el resto de la logica es identica a la version vigente.
CREATE OR REPLACE VIEW velotrack.vw_base_sesiones AS
WITH b AS (
  SELECT ts.id AS id_participacion, DATE(ts.session_date, 'America/Bogota') AS fecha, ts.status, ts.observations AS observaciones,
      sk.id AS id_atleta, sk.name AS atleta,
          CONCAT(SPLIT(sk.name, ' ')[SAFE_OFFSET(0)], ' ', ARRAY_REVERSE(SPLIT(sk.name, ' '))[SAFE_OFFSET(0)]) AS atleta_corto,
              cat.name AS categoria, tm.id AS id_equipo, tm.name AS equipo, v.name AS sede, co.id AS id_entrenador, co.name AS entrenador,
                  m.start_speed_kmh, m.max_speed_kmh, m.laps
                    FROM velotrack.training_session_current ts
                      JOIN velotrack.equivalencias_ids ea ON ea.entidad = 'atleta' AND ea.uuid_captura = ts.athlete_id
                        JOIN velotrack.skaters_current sk ON sk.id = ea.id_talento
                          LEFT JOIN velotrack.categories_current cat ON cat.id = sk.category_id
                            LEFT JOIN velotrack.equivalencias_ids et ON et.entidad = 'equipo' AND et.uuid_captura = ts.team_id
                              LEFT JOIN velotrack.teams_current tm ON tm.id = et.id_talento
                                LEFT JOIN velotrack.venues_current v ON v.id = tm.venue_id
                                  LEFT JOIN velotrack.equivalencias_ids ec ON ec.entidad = 'entrenador' AND ec.uuid_captura = ts.coach_id
                                    LEFT JOIN velotrack.coaches_current co ON co.id = ec.id_talento
                                      LEFT JOIN velotrack.session_metrics_current m ON m.session_id = ts.id
)
-- Sesión de equipo = mismo día, equipo y entrenador (en Captura cada sesión es individual).
SELECT DENSE_RANK() OVER (ORDER BY fecha, id_equipo, id_entrenador) AS id_sesion, * FROM b;

CREATE OR REPLACE VIEW velotrack.vw_atletas AS
WITH con_edad AS (
  SELECT s.*,
      DATE_DIFF(CURRENT_DATE('America/Bogota'), s.date_of_birth, YEAR)
        - IF(FORMAT_DATE('%m%d', CURRENT_DATE('America/Bogota')) < FORMAT_DATE('%m%d', s.date_of_birth), 1, 0) AS edad
  FROM velotrack.skaters_current s
),
actividad AS (
  SELECT id_atleta, MAX(fecha) AS ultima_sesion, COUNT(*) AS sesiones_total,
      MIN(mejor_vuelta_s) AS mejor_vuelta_historica_s, MAX(vel_max_kmh) AS vel_max_historica_kmh
  FROM velotrack.vw_participaciones GROUP BY id_atleta
),
entrenadores AS (
  SELECT ct.team_id, STRING_AGG(c.name, ', ' ORDER BY c.name) AS entrenador
  FROM velotrack.coach_teams_current ct JOIN velotrack.coaches_current c ON c.id = ct.coach_id
  GROUP BY ct.team_id
)
SELECT c.id AS id_atleta, c.name AS atleta, c.id_number AS numero_documento, c.date_of_birth AS fecha_nacimiento,
  c.edad, c.edad < 18 AS es_menor, cat.name AS categoria, t.name AS equipo, v.name AS sede, en.entrenador,
  act.ultima_sesion, act.sesiones_total, act.mejor_vuelta_historica_s, act.vel_max_historica_kmh, 1 AS conteo
FROM con_edad c
LEFT JOIN velotrack.categories_current cat ON cat.id = c.category_id
LEFT JOIN velotrack.teams_current t ON t.id = c.team_id
LEFT JOIN velotrack.venues_current v ON v.id = c.venue_id
LEFT JOIN entrenadores en ON en.team_id = c.team_id
LEFT JOIN actividad act ON act.id_atleta = c.id;
