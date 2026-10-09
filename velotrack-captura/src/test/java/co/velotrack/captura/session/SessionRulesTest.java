package co.velotrack.captura.session;

import static org.assertj.core.api.Assertions.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import co.velotrack.captura.session.SessionRequest.*;
import org.springframework.web.server.ResponseStatusException;

class SessionRulesTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    private SessionRequest request(SessionStatus status, TechnicalMetrics metrics, PhysicalIndicators physical, String notes) {
        return new SessionRequest(UUID.randomUUID(), Instant.parse("2026-09-27T15:00:00Z"),
                status, metrics, physical, notes, null);
    }

    private TechnicalMetrics metrics(int count, List<Lap> laps) {
        return new TechnicalMetrics(new BigDecimal("20"), new BigDecimal("40"), new BigDecimal("30"),
                count, laps, List.of());
    }

    @Test void allowsIncompleteDraftAndScheduledSession() {
        for (var status : List.of(SessionStatus.BORRADOR, SessionStatus.PROGRAMADA)) {
            var request = request(status, null, null, null);
            assertThat(validator.validate(request)).isEmpty();
            assertThatCode(() -> SessionRules.validate(request)).doesNotThrowAnyException();
        }
    }

    @Test void completedSessionRequiresAllLapTimes() {
        var request = request(SessionStatus.COMPLETADA,
                metrics(2, List.of(new Lap(new BigDecimal("20.5"), null))), null, null);
        assertThatThrownBy(() -> SessionRules.validate(request)).isInstanceOf(ResponseStatusException.class);
    }

    @Test void completedSessionRequiresTechnicalMetrics() {
        assertThatThrownBy(() -> SessionRules.validate(request(SessionStatus.COMPLETADA, null, null, null)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test void acceptsCompleteSessionWithPhysicalIndicators() {
        var request = request(SessionStatus.COMPLETADA,
                metrics(1, List.of(new Lap(new BigDecimal("30"), List.of(new BigDecimal("12"), new BigDecimal("18"))))),
                new PhysicalIndicators(new BigDecimal("8"), 120), "Viento fuerte");
        assertThat(validator.validate(request)).isEmpty();
        assertThatCode(() -> SessionRules.validate(request)).doesNotThrowAnyException();
    }

    @Test void rejectsNonPositiveLapTimesEvenInDraft() {
        for (String value : List.of("0", "-1")) {
            assertThat(validator.validate(request(SessionStatus.BORRADOR,
                    metrics(1, List.of(new Lap(new BigDecimal(value), null))), null, null))).isNotEmpty();
        }
    }

    @Test void validatesPhysicalRangesAndObservationLength() {
        assertThat(validator.validate(request(SessionStatus.BORRADOR, null,
                new PhysicalIndicators(new BigDecimal("10.1"), 3601), "a".repeat(2001)))).hasSize(3);
        assertThat(validator.validate(request(SessionStatus.BORRADOR, null,
                new PhysicalIndicators(BigDecimal.ZERO, 0), "a".repeat(2000)))).isEmpty();
    }

    @Test void rejectsNullLapAndNullSplit() {
        assertThat(validator.validate(request(SessionStatus.BORRADOR,
                metrics(1, java.util.Arrays.asList((Lap)null)), null, null))).isNotEmpty();
        assertThat(validator.validate(request(SessionStatus.BORRADOR,
                metrics(1, List.of(new Lap(BigDecimal.TEN, java.util.Arrays.asList((BigDecimal)null)))),
                null, null))).isNotEmpty();
    }

    @Test void rejectsSplitsLongerThanLap() {
        assertThatThrownBy(() -> SessionRules.validate(request(SessionStatus.COMPLETADA,
                metrics(1, List.of(new Lap(BigDecimal.TEN, List.of(new BigDecimal("11"))))), null, null)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test void rejectsSpeedsAboveMaximum() {
        var metrics = new TechnicalMetrics(new BigDecimal("50"), new BigDecimal("40"), null, null, null, null);
        assertThatThrownBy(() -> SessionRules.validate(request(SessionStatus.BORRADOR, metrics, null, null)))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test void rejectsOverlappingIntervals() {
        var metrics = new TechnicalMetrics(null, null, null, 3, null,
                List.of(new Interval(0, 60, 1), new Interval(50, 120, 2)));
        assertThatThrownBy(() -> SessionRules.validate(request(SessionStatus.BORRADOR, metrics, null, null)))
                .isInstanceOf(ResponseStatusException.class);
    }
}
