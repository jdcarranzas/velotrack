package co.velotrack.captura.session;

import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class SessionRules {
    private SessionRules() {}

    static void validate(SessionRequest request) {
        var t = request.technical();
        if (request.status() == SessionStatus.COMPLETADA) {
            require(t != null && t.startSpeedKmh() != null && t.completedLaps() != null
                    && t.completedLaps() > 0 && t.laps() != null
                    && t.laps().size() == t.completedLaps(),
                    "Una sesión completada requiere velocidad de salida, al menos una vuelta y todos sus tiempos");
        }
        if (t == null) return;
        if (t.completedLaps() != null && t.laps() != null) {
            require(t.laps().size() <= t.completedLaps(), "Hay más tiempos que vueltas declaradas");
        }
        if (t.maxSpeedKmh() != null) {
            require(t.startSpeedKmh() == null || t.startSpeedKmh().compareTo(t.maxSpeedKmh()) <= 0,
                    "La velocidad de salida no puede superar la máxima");
            require(t.averageSpeedKmh() == null || t.averageSpeedKmh().compareTo(t.maxSpeedKmh()) <= 0,
                    "La velocidad media no puede superar la máxima");
        }
        if (t.laps() != null) {
            for (var lap : t.laps()) {
                if (lap.splitSeconds() != null) {
                    var sum = lap.splitSeconds().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                    require(sum.compareTo(lap.timeSeconds()) <= 0, "Los parciales superan el tiempo de la vuelta");
                }
            }
        }
        if (t.intervals() != null) {
            int previousEnd = -1;
            int totalLaps = 0;
            for (var interval : t.intervals()) {
                require(interval.fromSecond() < interval.toSecond(), "Intervalo de tiempo inválido");
                require(interval.fromSecond() >= previousEnd, "Los intervalos deben estar ordenados y no superponerse");
                previousEnd = interval.toSecond();
                totalLaps += interval.completedLaps();
            }
            require(t.completedLaps() == null || totalLaps <= t.completedLaps(),
                    "Las vueltas por intervalo superan el total de la sesión");
        }
    }

    static void require(boolean condition, String message) {
        if (!condition) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
