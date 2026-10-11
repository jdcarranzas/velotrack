package co.velotrack.captura.session;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import co.velotrack.captura.config.PrototypeAccess;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class SessionServiceTest {
    private final SessionRepository repository = mock(SessionRepository.class);
    private final UUID athlete = UUID.randomUUID();
    private final UUID coach = UUID.randomUUID();
    private final UUID team = UUID.randomUUID();
    private final Instant date = Instant.parse("2026-09-27T15:00:00Z");
    private final SessionEvents events = mock(SessionEvents.class);
    private SessionService service;

    @BeforeEach void setup() {
        service = new SessionService(repository, new PrototypeAccess(coach, team, Set.of(athlete)), events);
    }

    private TrainingSession session(UUID id, UUID athleteId, UUID teamId) {
        return new TrainingSession(id, athleteId, coach, teamId, date, SessionStatus.BORRADOR,
                null, null, "Original", 0, date, date);
    }

    @Test void rejectsCreationForUnassignedAthleteBeforeWriting() {
        var request = new SessionRequest(UUID.randomUUID(), date, SessionStatus.BORRADOR, null, null, null, null);
        assertThatThrownBy(() -> service.create(request)).isInstanceOfSatisfying(ResponseStatusException.class,
                e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));
        verifyNoInteractions(repository);
    }

    @Test void rejectsForeignTeamEvenWhenAthleteIdMatches() {
        UUID id = UUID.randomUUID();
        when(repository.find(id)).thenReturn(Optional.of(session(id, athlete, UUID.randomUUID())));
        assertThatThrownBy(() -> service.observations(id, 0, "No autorizado"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN));
        verify(repository, never()).updateObservations(any(), anyLong(), any());
    }

    @Test void rejectsForeignAthleteOnReadingAndEditing() {
        UUID id = UUID.randomUUID();
        when(repository.find(id)).thenReturn(Optional.of(session(id, UUID.randomUUID(), team)));
        assertThatThrownBy(() -> service.get(id)).isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.observations(id, 0, "No autorizado")).isInstanceOf(ResponseStatusException.class);
        verify(repository, never()).updateObservations(any(), anyLong(), any());
    }

    @Test void staleObservationVersionReturnsConflict() {
        UUID id = UUID.randomUUID();
        when(repository.find(id)).thenReturn(Optional.of(session(id, athlete, team)));
        when(repository.updateObservations(id, 0, "Cambio")).thenReturn(false);
        assertThatThrownBy(() -> service.observations(id, 0, "Cambio"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test void rejectsAthleteChangeAndMissingVersionBeforeUpdate() {
        UUID id = UUID.randomUUID();
        when(repository.find(id)).thenReturn(Optional.of(session(id, athlete, team)));
        assertThatThrownBy(() -> service.update(id,
                new SessionRequest(UUID.randomUUID(), date, SessionStatus.BORRADOR, null, null, null, 0L)))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> service.update(id,
                new SessionRequest(athlete, date, SessionStatus.BORRADOR, null, null, null, null)))
                .isInstanceOf(ResponseStatusException.class);
        verify(repository, never()).update(any(), any());
    }

    @Test void publishesSavedSessionAfterCreate() {
        var saved = session(UUID.randomUUID(), athlete, team);
        when(repository.find(any())).thenReturn(Optional.of(saved));
        var request = new SessionRequest(athlete, date, SessionStatus.BORRADOR, null, null, null, null);
        assertThat(service.create(request)).isSameAs(saved);
        verify(events).sessionSaved(saved);
    }

    @Test void doesNotPublishWhenObservationVersionConflicts() {
        UUID id = UUID.randomUUID();
        when(repository.find(id)).thenReturn(Optional.of(session(id, athlete, team)));
        when(repository.updateObservations(id, 0, "Cambio")).thenReturn(false);
        assertThatThrownBy(() -> service.observations(id, 0, "Cambio")).isInstanceOf(ResponseStatusException.class);
        verifyNoInteractions(events);
    }

    @Test void historyTranslatesSkaterIdToCaptureUuid() {
        var found = session(UUID.randomUUID(), athlete, team);
        when(repository.findAthleteUuid(7)).thenReturn(Optional.of(athlete));
        when(repository.listByAthlete(athlete, date, date.plusSeconds(60), 50, 0)).thenReturn(java.util.List.of(found));
        assertThat(service.history(7, date, date.plusSeconds(60), 50, 0)).containsExactly(found);
    }

    @Test void historyReturnsNotFoundWhenSkaterHasNoEquivalence() {
        when(repository.findAthleteUuid(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.history(99, date, date.plusSeconds(60), 50, 0))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
        verify(repository, never()).listByAthlete(any(), any(), any(), anyInt(), anyInt());
    }

    @Test void rejectsInvertedRangeBeforeQuerying() {
        assertThatThrownBy(() -> service.history(1, date.plusSeconds(1), date, 50, 0))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
        verifyNoInteractions(repository);
    }
}
