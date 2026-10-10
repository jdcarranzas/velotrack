CREATE TABLE training_session (
    id UUID PRIMARY KEY,
    athlete_id UUID NOT NULL,
    coach_id UUID NOT NULL,
    team_id UUID NOT NULL,
    session_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(12) NOT NULL CHECK (status IN ('PROGRAMADA','BORRADOR','COMPLETADA')),
    observations VARCHAR(2000),
    version BIGINT NOT NULL DEFAULT 0 CHECK (version >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX session_athlete_date ON training_session (team_id, athlete_id, session_date DESC, id DESC);
CREATE INDEX session_agenda ON training_session (team_id, status, session_date);

-- Un punto temporal por sesión. Metadatos y mediciones se guardan en una transacción.
CREATE TABLE session_metrics (
    session_id UUID NOT NULL REFERENCES training_session(id) ON DELETE CASCADE,
    measured_at TIMESTAMPTZ NOT NULL,
    start_speed_kmh NUMERIC CHECK (start_speed_kmh BETWEEN 0 AND 150),
    max_speed_kmh NUMERIC CHECK (max_speed_kmh BETWEEN 0 AND 150),
    average_speed_kmh NUMERIC CHECK (average_speed_kmh BETWEEN 0 AND 150),
    completed_laps INTEGER CHECK (completed_laps BETWEEN 0 AND 1000),
    laps JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(laps) = 'array'),
    intervals JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(intervals) = 'array'),
    resistance_score NUMERIC CHECK (resistance_score BETWEEN 0 AND 10),
    recovery_seconds INTEGER CHECK (recovery_seconds BETWEEN 0 AND 3600),
    PRIMARY KEY (session_id, measured_at)
);
-- No se elimina ni comprime automáticamente: borradores y observaciones siguen editables.
