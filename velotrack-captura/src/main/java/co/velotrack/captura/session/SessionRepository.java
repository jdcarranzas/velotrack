package co.velotrack.captura.session;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import co.velotrack.captura.session.SessionRequest.*;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

@Repository
public class SessionRepository {
    private static final String SELECT = """
            SELECT s.*, m.start_speed_kmh, m.max_speed_kmh, m.average_speed_kmh,
                   m.completed_laps, m.laps, m.intervals, m.resistance_score, m.recovery_seconds
            FROM training_session s JOIN session_metrics m
              ON m.session_id = s.id AND m.measured_at = s.session_date
            """;
    private final NamedParameterJdbcTemplate jdbc;
    private final JsonMapper json;

    public SessionRepository(NamedParameterJdbcTemplate jdbc, JsonMapper json) {
        this.jdbc = jdbc;
        this.json = json;
    }

    public Optional<TrainingSession> find(UUID id) {
        return jdbc.query(SELECT + " WHERE s.id = :id",
                new MapSqlParameterSource("id", id), this::map).stream().findFirst();
    }

    public List<TrainingSession> list(UUID teamId, List<UUID> athleteIds, Instant from, Instant to,
                                     SessionStatus status, UUID coachId, int limit, int offset) {
        String sql = SELECT + """
                 WHERE s.team_id = :team AND s.athlete_id IN (:athletes)
                 AND s.session_date >= :from AND s.session_date < :to
                 AND m.measured_at >= :from AND m.measured_at < :to
                """;
        var params = new MapSqlParameterSource("team", teamId).addValue("athletes", athleteIds)
                .addValue("from", Timestamp.from(from)).addValue("to", Timestamp.from(to))
                .addValue("limit", limit).addValue("offset", offset);
        if (status != null) {
            sql += " AND s.status = :status";
            params.addValue("status", status.name());
        }
        if (coachId != null) {
            sql += " AND s.coach_id = :coach";
            params.addValue("coach", coachId);
        }
        return jdbc.query(sql + " ORDER BY s.session_date DESC, s.id DESC LIMIT :limit OFFSET :offset",
                params, this::map);
    }

    public void insert(UUID id, UUID coachId, UUID teamId, SessionRequest request) {
        var p = metadata(id, request).addValue("coach", coachId).addValue("team", teamId);
        jdbc.update("""
                INSERT INTO training_session(id, athlete_id, coach_id, team_id, session_date, status, observations)
                VALUES (:id, :athlete, :coach, :team, :date, :status, :observations)
                """, p);
        insertMetrics(id, request);
    }

    public boolean update(UUID id, SessionRequest request) {
        int count = jdbc.update("""
                UPDATE training_session SET session_date=:date, status=:status,
                    observations=:observations, version=version+1, updated_at=now()
                WHERE id=:id AND version=:version
                """, metadata(id, request).addValue("version", request.version()));
        if (count == 0) return false;
        jdbc.update("DELETE FROM session_metrics WHERE session_id=:id", new MapSqlParameterSource("id", id));
        insertMetrics(id, request);
        return true;
    }

    public boolean updateObservations(UUID id, long version, String observations) {
        return jdbc.update("""
                UPDATE training_session SET observations=:observations, version=version+1, updated_at=now()
                WHERE id=:id AND version=:version
                """, new MapSqlParameterSource("id", id).addValue("version", version)
                .addValue("observations", observations)) == 1;
    }

    private MapSqlParameterSource metadata(UUID id, SessionRequest r) {
        return new MapSqlParameterSource("id", id).addValue("athlete", r.athleteId())
                .addValue("date", Timestamp.from(r.sessionDate())).addValue("status", r.status().name())
                .addValue("observations", r.observations());
    }

    private void insertMetrics(UUID id, SessionRequest r) {
        var t = r.technical();
        var p = r.physical();
        var params = new MapSqlParameterSource("id", id).addValue("date", Timestamp.from(r.sessionDate()))
                .addValue("start", t == null ? null : t.startSpeedKmh())
                .addValue("max", t == null ? null : t.maxSpeedKmh())
                .addValue("average", t == null ? null : t.averageSpeedKmh())
                .addValue("completed", t == null ? null : t.completedLaps())
                .addValue("laps", json.writeValueAsString(t == null || t.laps() == null ? List.of() : t.laps()))
                .addValue("intervals", json.writeValueAsString(t == null || t.intervals() == null ? List.of() : t.intervals()))
                .addValue("resistance", p == null ? null : p.resistanceScore())
                .addValue("recovery", p == null ? null : p.recoverySeconds());
        jdbc.update("""
                INSERT INTO session_metrics(session_id, measured_at, start_speed_kmh, max_speed_kmh,
                    average_speed_kmh, completed_laps, laps, intervals, resistance_score, recovery_seconds)
                VALUES (:id, :date, :start, :max, :average, :completed,
                    CAST(:laps AS jsonb), CAST(:intervals AS jsonb), :resistance, :recovery)
                """, params);
    }

    private TrainingSession map(ResultSet rs, int row) throws SQLException {
        var technical = new TechnicalMetrics(rs.getBigDecimal("start_speed_kmh"),
                rs.getBigDecimal("max_speed_kmh"), rs.getBigDecimal("average_speed_kmh"),
                rs.getObject("completed_laps", Integer.class),
                json.readValue(rs.getString("laps"), new TypeReference<List<Lap>>() {}),
                json.readValue(rs.getString("intervals"), new TypeReference<List<Interval>>() {}));
        var physical = new PhysicalIndicators(rs.getBigDecimal("resistance_score"),
                rs.getObject("recovery_seconds", Integer.class));
        return new TrainingSession(rs.getObject("id", UUID.class), rs.getObject("athlete_id", UUID.class),
                rs.getObject("coach_id", UUID.class), rs.getObject("team_id", UUID.class),
                rs.getTimestamp("session_date").toInstant(), SessionStatus.valueOf(rs.getString("status")),
                technical, physical, rs.getString("observations"), rs.getLong("version"),
                rs.getTimestamp("created_at").toInstant(), rs.getTimestamp("updated_at").toInstant());
    }
}
