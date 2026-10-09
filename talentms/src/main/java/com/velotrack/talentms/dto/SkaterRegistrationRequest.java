package com.velotrack.talentms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class SkaterRegistrationRequest {
    @NotBlank(message = "Name is mandatory")
    private String name;

    @NotBlank(message = "ID number is mandatory")
    private String idNumber;

    @NotNull(message = "Date of birth is mandatory")
    private LocalDate dateOfBirth;

    @NotNull(message = "Category ID is mandatory")
    private Integer categoryId;

    @NotNull(message = "Team ID is mandatory")
    private Integer teamId;

    @NotNull(message = "Venue ID is mandatory")
    private Integer venueId;
}
