package co.velotrack.captura.session;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record SessionRequest(
        @NotNull UUID athleteId,
        @NotNull Instant sessionDate,
        @NotNull SessionStatus status,
        @Valid TechnicalMetrics technical,
        @Valid PhysicalIndicators physical,
        @Size(max = 2000) String observations,
        @PositiveOrZero Long version) {

    public record TechnicalMetrics(
            @DecimalMin("0.0") @DecimalMax("150.0") BigDecimal startSpeedKmh,
            @DecimalMin("0.0") @DecimalMax("150.0") BigDecimal maxSpeedKmh,
            @DecimalMin("0.0") @DecimalMax("150.0") BigDecimal averageSpeedKmh,
            @Min(0) @Max(1000) Integer completedLaps,
            @Size(max = 1000) List<@NotNull @Valid Lap> laps,
            @Size(max = 1000) List<@NotNull @Valid Interval> intervals) {}

    /** Los parciales son duraciones de segmentos, no tiempos acumulados. */
    public record Lap(
            @NotNull @DecimalMin(value = "0", inclusive = false) @DecimalMax("86400") BigDecimal timeSeconds,
            @Size(max = 100) List<@NotNull @DecimalMin(value = "0", inclusive = false)
                    @DecimalMax("86400") BigDecimal> splitSeconds) {}

    public record Interval(
            @NotNull @Min(0) @Max(86400) Integer fromSecond,
            @NotNull @Min(1) @Max(86400) Integer toSecond,
            @NotNull @Min(0) @Max(1000) Integer completedLaps) {}

    /** Escalas del prototipo: resistencia 0-10; recuperación en segundos 0-3600. */
    public record PhysicalIndicators(
            @DecimalMin("0") @DecimalMax("10") BigDecimal resistanceScore,
            @Min(0) @Max(3600) Integer recoverySeconds) {}
}
