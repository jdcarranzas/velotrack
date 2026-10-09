package com.velotrack.talentms.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessAuditEntryResponse {
    private Integer id;
    private Integer coachId;
    private Integer teamId;
    private Integer venueId;
    private String actionType;
    private Integer performedById;
    private OffsetDateTime changedAt;
}
