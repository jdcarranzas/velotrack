package co.velotrack.captura.session;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class SessionController {
    private final SessionService service;
    public SessionController(SessionService service) { this.service = service; }

    @PostMapping("/sessions")
    public ResponseEntity<TrainingSession> create(@Valid @RequestBody SessionRequest request) {
        var created = service.create(request);
        return ResponseEntity.created(URI.create("/api/v1/sessions/" + created.id())).body(created);
    }

    @GetMapping("/sessions/{id}")
    public TrainingSession get(@PathVariable UUID id) { return service.get(id); }

    @PutMapping("/sessions/{id}")
    public TrainingSession update(@PathVariable UUID id, @Valid @RequestBody SessionRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/sessions/{id}/observations")
    public TrainingSession observations(@PathVariable UUID id, @Valid @RequestBody ObservationsRequest request) {
        return service.observations(id, request.version(), request.observations());
    }

    @GetMapping("/athletes/{athleteId}/sessions")
    public List<TrainingSession> history(@PathVariable UUID athleteId,
            @RequestParam Instant from, @RequestParam Instant to,
            @RequestParam(defaultValue = "50") @Min(1) @Max(100) int limit,
            @RequestParam(defaultValue = "0") @Min(0) @Max(100000) int offset) {
        return service.history(athleteId, from, to, limit, offset);
    }

    @GetMapping("/agenda")
    public List<TrainingSession> agenda(@RequestParam Instant from, @RequestParam Instant to,
            @RequestParam(defaultValue = "false") boolean team,
            @RequestParam(defaultValue = "50") @Min(1) @Max(100) int limit,
            @RequestParam(defaultValue = "0") @Min(0) @Max(100000) int offset) {
        return service.agenda(from, to, team, limit, offset);
    }

    public record ObservationsRequest(@NotNull @PositiveOrZero Long version,
                                      @Size(max = 2000) String observations) {}
}
