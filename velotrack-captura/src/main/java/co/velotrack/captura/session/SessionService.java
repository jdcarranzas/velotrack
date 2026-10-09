package co.velotrack.captura.session;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import co.velotrack.captura.config.PrototypeAccess;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class SessionService {
    private static final Logger LOG = LoggerFactory.getLogger(SessionService.class);
    private final SessionRepository repository;
    private final PrototypeAccess access;

    public SessionService(SessionRepository repository, PrototypeAccess access) {
        this.repository = repository;
        this.access = access;
    }

    @Transactional
    public TrainingSession create(SessionRequest request) {
        authorizeAthlete(request.athleteId());
        SessionRules.require(request.version() == null, "La versiÃ³n se omite al crear");
        SessionRules.validate(request);
        UUID id = UUID.randomUUID();
        repository.insert(id, access.coachId(), access.teamId(), request);
        LOG.info("event=session_created sessionId={} coachId={}", id, access.coachId());
        return get(id);
    }

    public TrainingSession get(UUID id) {
        var session = repository.find(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "SesiÃ³n no encontrada"));
        if (!session.teamId().equals(access.teamId())) deny();
        authorizeAthlete(session.athleteId());
        return session;
    }

    @Transactional
    public TrainingSession update(UUID id, SessionRequest request) {
        var previous = get(id);
        SessionRules.require(previous.athleteId().equals(request.athleteId()), "No se puede cambiar el atleta de una sesiÃ³n");
        SessionRules.require(request.version() != null, "La versiÃ³n es obligatoria al editar");
        // Una sesiÃ³n completada conserva ese estado para no desaparecer de su historial.
        SessionRules.require(previous.status() != SessionStatus.COMPLETADA ||
                request.status() == SessionStatus.COMPLETADA, "Una sesiÃ³n completada no puede volver a borrador o programada");
        SessionRules.validate(request);
        if (!repository.update(id, request)) conflict();
        LOG.info("event=session_updated sessionId={} coachId={}", id, access.coachId());
        return get(id);
    }

    @Transactional
    public TrainingSession observations(UUID id, long version, String observations) {
        get(id);
        if (!repository.updateObservations(id, version, observations)) conflict();
        LOG.info("event=observations_updated sessionId={} coachId={}", id, access.coachId());
        return get(id);
    }

    public List<TrainingSession> history(UUID athleteId, Instant from, Instant to, int limit, int offset) {
        authorizeAthlete(athleteId);
        validateRange(from, to);
        return repository.list(access.teamId(), List.of(athleteId), from, to, null, null, limit, offset);
    }

    public List<TrainingSession> agenda(Instant from, Instant to, boolean team, int limit, int offset) {
        validateRange(from, to);
        return repository.list(access.teamId(), List.copyOf(access.athleteIds()), from, to,
                SessionStatus.PROGRAMADA, team ? null : access.coachId(), limit, offset);
    }

    private void validateRange(Instant from, Instant to) {
        SessionRules.require(from.isBefore(to), "from debe ser anterior a to; intervalo [from, to)");
    }

    private void authorizeAthlete(UUID id) {
        if (!access.athleteIds().contains(id)) deny();
    }

    private void deny() {
        LOG.warn("event=access_denied coachId={}", access.coachId());
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sin permiso sobre este atleta o equipo");
    }

    private void conflict() {
        throw new ResponseStatusException(HttpStatus.CONFLICT, "La sesiÃ³n cambiÃ³; consulte la versiÃ³n actual antes de editar");
    }
}
