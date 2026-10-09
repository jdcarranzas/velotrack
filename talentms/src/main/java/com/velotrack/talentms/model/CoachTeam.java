package com.velotrack.talentms.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coach_teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachTeam {

    @EmbeddedId
    private CoachTeamId id;

    @ManyToOne
    @MapsId("coachId")
    @JoinColumn(name = "coach_id")
    private Coach coach;

    @ManyToOne
    @MapsId("teamId")
    @JoinColumn(name = "team_id")
    private Team team;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class CoachTeamId implements java.io.Serializable {
        private Integer coachId;
        private Integer teamId;
    }
}
