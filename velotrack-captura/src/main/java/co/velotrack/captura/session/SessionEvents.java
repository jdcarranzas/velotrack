package co.velotrack.captura.session;

import co.velotrack.captura.pubsub.EventPublisher;
import co.velotrack.captura.pubsub.PubSubProperties;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import tools.jackson.databind.json.JsonMapper;

/**
 * Publica cada sesion guardada hacia las tablas BigQuery training_session y session_metrics.
 * Es append-only: cada version genera una fila nueva y las vistas se quedan con la ultima.
 */
@Component
public class SessionEvents {
    private final EventPublisher publisher;
    private final PubSubProperties properties;
    private final JsonMapper json;

    public SessionEvents(EventPublisher publisher, PubSubProperties properties, JsonMapper json) {
        this.publisher = publisher;
        this.properties = properties;
        this.json = json;
    }

    /** Publica despues del commit; sin transaccion activa publica de inmediato. */
    public void sessionSaved(TrainingSession session) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            publishNow(session);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                publishNow(session);
            }
        });
    }

    private void publishNow(TrainingSession session) {
        publisher.publish(properties.topics().trainingSession(), trainingSessionRow(session));
        publisher.publish(properties.topics().sessionMetrics(), sessionMetricsRow(session));
    }

    Map<String, Object> trainingSessionRow(TrainingSession session) {
        var row = new LinkedHashMap<String, Object>();
        row.put("id", session.id().toString());
        row.put("athlete_id", session.athleteId().toString());
        row.put("coach_id", session.coachId().toString());
        row.put("team_id", session.teamId().toString());
        row.put("session_date", session.sessionDate().toString());
        row.put("status", session.status().name());
        row.put("observations", session.observations());
        row.put("version", session.version());
        row.put("created_at", session.createdAt().toString());
        row.put("updated_at", session.updatedAt().toString());
        return row;
    }

    Map<String, Object> sessionMetricsRow(TrainingSession session) {
        var technical = session.technical();
        var physical = session.physical();
        var row = new LinkedHashMap<String, Object>();
        row.put("session_id", session.id().toString());
        row.put("measured_at", session.sessionDate().toString());
        row.put("session_version", session.version());
        row.put("start_speed_kmh", technical == null ? null : technical.startSpeedKmh());
        row.put("max_speed_kmh", technical == null ? null : technical.maxSpeedKmh());
        row.put("average_speed_kmh", technical == null ? null : technical.averageSpeedKmh());
        row.put("completed_laps", technical == null ? null : technical.completedLaps());
        // Las columnas JSON de BigQuery reciben el documento serializado como string.
        row.put("laps", json.writeValueAsString(technical == null || technical.laps() == null
                ? List.of() : technical.laps()));
        row.put("intervals", json.writeValueAsString(technical == null || technical.intervals() == null
                ? List.of() : technical.intervals()));
        row.put("resistance_score", physical == null ? null : physical.resistanceScore());
        row.put("recovery_seconds", physical == null ? null : physical.recoverySeconds());
        return row;
    }
}
