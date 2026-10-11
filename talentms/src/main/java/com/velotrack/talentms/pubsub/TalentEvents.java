package com.velotrack.talentms.pubsub;

import com.velotrack.talentms.model.AccessAuditLog;
import com.velotrack.talentms.model.Category;
import com.velotrack.talentms.model.Coach;
import com.velotrack.talentms.model.Skater;
import com.velotrack.talentms.model.Team;
import com.velotrack.talentms.model.Venue;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Publica cada entidad guardada hacia su tabla BigQuery. Es append-only: cada guardado agrega una
 * fila con published_at y las vistas se quedan con la mas reciente por id.
 */
@Component
@RequiredArgsConstructor
public class TalentEvents {

    private final EventPublisher publisher;
    private final PubSubProperties properties;

    public void categorySaved(Category category) {
        Map<String, Object> row = row();
        row.put("id", category.getId());
        row.put("name", category.getName());
        row.put("description", category.getDescription());
        row.put("is_active", category.getIsActive());
        row.put("created_at", utc(category.getCreatedAt()));
        publishAfterCommit(properties.topics().categories(), row);
    }

    public void venueSaved(Venue venue) {
        Map<String, Object> row = row();
        row.put("id", venue.getId());
        row.put("organization_id", venue.getOrganizationId());
        row.put("name", venue.getName());
        row.put("description", venue.getDescription());
        row.put("is_active", venue.getIsActive());
        row.put("created_at", utc(venue.getCreatedAt()));
        publishAfterCommit(properties.topics().venues(), row);
    }

    public void teamSaved(Team team) {
        Map<String, Object> row = row();
        row.put("id", team.getId());
        row.put("venue_id", team.getVenueId());
        row.put("name", team.getName());
        row.put("description", team.getDescription());
        row.put("is_active", team.getIsActive());
        row.put("created_at", utc(team.getCreatedAt()));
        publishAfterCommit(properties.topics().teams(), row);
    }

    public void skaterSaved(Skater skater) {
        Map<String, Object> row = row();
        row.put("id", skater.getId());
        row.put("name", skater.getName());
        row.put("id_number", skater.getIdNumber());
        row.put("date_of_birth", skater.getDateOfBirth() == null ? null : skater.getDateOfBirth().toString());
        row.put("category_id", skater.getCategory() == null ? null : skater.getCategory().getId());
        row.put("team_id", skater.getTeam() == null ? null : skater.getTeam().getId());
        row.put("venue_id", skater.getVenue() == null ? null : skater.getVenue().getId());
        row.put("created_at", utc(skater.getCreatedAt()));
        publishAfterCommit(properties.topics().skaters(), row);
    }

    /** No incluye passwordHash: la tabla coaches de BigQuery no lo almacena. */
    public void coachSaved(Coach coach) {
        Map<String, Object> row = row();
        row.put("id", coach.getId());
        row.put("name", coach.getName());
        row.put("email", coach.getEmail());
        row.put("status", coach.getStatus());
        row.put("created_at", utc(coach.getCreatedAt()));
        row.put("updated_at", utc(coach.getUpdatedAt()));
        publishAfterCommit(properties.topics().coaches(), row);
    }

    /**
     * Publica el conjunto completo de equipos del entrenador con el mismo published_at: la vista
     * toma el ultimo published_at por coach_id, asi las asignaciones removidas desaparecen.
     */
    public void coachTeamsSaved(Integer coachId, Collection<Integer> teamIds) {
        String publishedAt = Instant.now().toString();
        for (Integer teamId : teamIds) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("coach_id", coachId);
            row.put("team_id", teamId);
            row.put("published_at", publishedAt);
            publishAfterCommit(properties.topics().coachTeams(), row);
        }
    }

    public void accessAuditLogged(AccessAuditLog entry) {
        Map<String, Object> row = row();
        row.put("id", entry.getId());
        row.put("coach_id", entry.getCoach() == null ? null : entry.getCoach().getId());
        row.put("team_id", entry.getTeam() == null ? null : entry.getTeam().getId());
        row.put("venue_id", entry.getVenue() == null ? null : entry.getVenue().getId());
        row.put("action_type", entry.getActionType());
        row.put("performed_by_id", entry.getPerformedBy() == null ? null : entry.getPerformedBy().getId());
        row.put("changed_at", utc(entry.getChangedAt()));
        publishAfterCommit(properties.topics().accessAuditLog(), row);
    }

    private Map<String, Object> row() {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("published_at", Instant.now().toString());
        return row;
    }

    private String utc(OffsetDateTime timestamp) {
        return timestamp == null ? null : timestamp.toInstant().toString();
    }

    /** Publica despues del commit; sin transaccion activa publica de inmediato. */
    private void publishAfterCommit(String topic, Map<String, Object> row) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            publisher.publish(topic, row);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                publisher.publish(topic, row);
            }
        });
    }
}
