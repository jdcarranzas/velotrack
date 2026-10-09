package co.velotrack.captura.session;

import java.time.Instant;
import java.util.UUID;
import co.velotrack.captura.session.SessionRequest.PhysicalIndicators;
import co.velotrack.captura.session.SessionRequest.TechnicalMetrics;

public record TrainingSession(UUID id, UUID athleteId, UUID coachId, UUID teamId,
        Instant sessionDate, SessionStatus status, TechnicalMetrics technical,
        PhysicalIndicators physical, String observations, long version,
        Instant createdAt, Instant updatedAt) {}
