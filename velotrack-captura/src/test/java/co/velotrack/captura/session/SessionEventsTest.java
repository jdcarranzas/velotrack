package co.velotrack.captura.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import co.velotrack.captura.pubsub.EventPublisher;
import co.velotrack.captura.pubsub.PubSubProperties;
import co.velotrack.captura.session.SessionRequest.Interval;
import co.velotrack.captura.session.SessionRequest.Lap;
import co.velotrack.captura.session.SessionRequest.PhysicalIndicators;
import co.velotrack.captura.session.SessionRequest.TechnicalMetrics;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

class SessionEventsTest {
    private final EventPublisher publisher = mock(EventPublisher.class);
    private final PubSubProperties properties =
            new PubSubProperties(true, "project", new PubSubProperties.Topics("training-topic", "metrics-topic"));
    private final SessionEvents events = new SessionEvents(publisher, properties, JsonMapper.builder().build());
    private final Instant date = Instant.parse("2026-09-27T15:00:00Z");

    private TrainingSession completeSession() {
        var technical = new TechnicalMetrics(new BigDecimal("10.5"), new BigDecimal("30"), new BigDecimal("22.25"), 3,
                List.of(new Lap(new BigDecimal("45.2"), List.of(new BigDecimal("20.1")))),
                List.of(new Interval(0, 60, 1)));
        return new TrainingSession(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), date,
                SessionStatus.COMPLETADA, technical, new PhysicalIndicators(new BigDecimal("7.5"), 90),
                "Buena sesion", 2, date, date.plusSeconds(60));
    }

    @Test void mapsTrainingSessionToBigQueryColumns() {
        var session = completeSession();
        var row = events.trainingSessionRow(session);
        assertThat(row).containsEntry("id", session.id().toString())
                .containsEntry("session_date", "2026-09-27T15:00:00Z")
                .containsEntry("status", "COMPLETADA")
                .containsEntry("version", 2L)
                .containsEntry("updated_at", "2026-09-27T15:01:00Z");
    }

    @Test void mapsMetricsWithJsonColumnsAsStrings() {
        var session = completeSession();
        var row = events.sessionMetricsRow(session);
        assertThat(row).containsEntry("session_id", session.id().toString())
                .containsEntry("measured_at", "2026-09-27T15:00:00Z")
                .containsEntry("session_version", 2L)
                .containsEntry("completed_laps", 3)
                .containsEntry("recovery_seconds", 90);
        assertThat(row.get("laps")).isInstanceOf(String.class);
        assertThat((String) row.get("laps")).contains("45.2");
        assertThat((String) row.get("intervals")).contains("\"toSecond\":60");
    }

    @Test void mapsEmptyMetricsAsEmptyJsonArrays() {
        var session = new TrainingSession(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                date, SessionStatus.BORRADOR, null, null, null, 0, date, date);
        var row = events.sessionMetricsRow(session);
        assertThat(row.get("laps")).isEqualTo("[]");
        assertThat(row.get("intervals")).isEqualTo("[]");
        assertThat(row.get("start_speed_kmh")).isNull();
    }

    @Test void publishesBothTopicsWhenNoTransactionIsActive() {
        events.sessionSaved(completeSession());
        verify(publisher).publish(eq("training-topic"), anyMap());
        verify(publisher).publish(eq("metrics-topic"), anyMap());
    }
}
