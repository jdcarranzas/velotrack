package com.velotrack.talentms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VenueResponse {
    private Integer id;
    private String name;
    private String description;
    private Integer organizationId;
    private Boolean isActive;
}
