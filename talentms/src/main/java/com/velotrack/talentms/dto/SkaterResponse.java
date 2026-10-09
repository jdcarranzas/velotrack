package com.velotrack.talentms.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
public class SkaterResponse {
    private Integer id;
    private String name;
    private String idNumber;
    private LocalDate dateOfBirth;
    private Integer categoryId;
    private Integer teamId;
    private Integer venueId;
    private OffsetDateTime createdAt;
}