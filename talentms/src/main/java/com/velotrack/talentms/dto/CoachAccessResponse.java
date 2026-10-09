package com.velotrack.talentms.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CoachAccessResponse {
    private Integer coachId;
    private List<Integer> teamIds;
    private List<Integer> venueIds;
}
