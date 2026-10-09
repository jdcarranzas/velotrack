package co.velotrack.captura.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;
import java.util.UUID;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** Sustituto configurable de Identidad y Talento para un entrenador y un equipo. */
@Validated
@ConfigurationProperties("prototype.access")
public record PrototypeAccess(
        @NotBlank String username,
        @NotBlank @Size(min = 12) String password,
        @NotNull UUID coachId,
        @NotNull UUID teamId,
        @NotEmpty Set<@NotNull UUID> athleteIds) {}
