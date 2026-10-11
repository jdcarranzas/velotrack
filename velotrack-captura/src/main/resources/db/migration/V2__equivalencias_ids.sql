-- Traduce el UUID usado en captura al id numérico de talentms (skaters, teams, coaches).
CREATE TABLE IF NOT EXISTS equivalencias_ids (
    entidad VARCHAR(12) NOT NULL CHECK (entidad IN ('atleta','equipo','entrenador')),
    uuid_captura UUID NOT NULL,
    id_talento INTEGER NOT NULL,
    PRIMARY KEY (entidad, uuid_captura),
    UNIQUE (entidad, id_talento)
);
