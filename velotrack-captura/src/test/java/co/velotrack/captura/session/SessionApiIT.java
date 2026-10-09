package co.velotrack.captura.session;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class SessionApiIT {
    private static final String ATHLETE = "33333333-3333-3333-3333-333333333333";
    private static final String PASSWORD = "test-only-password-123";
    @Container
    static PostgreSQLContainer db = new PostgreSQLContainer(
            DockerImageName.parse("timescale/timescaledb:2.23.1-pg17").asCompatibleSubstituteFor("postgres"));

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", db::getJdbcUrl);
        r.add("spring.datasource.username", db::getUsername);
        r.add("spring.datasource.password", db::getPassword);
        r.add("prototype.access.password", () -> PASSWORD);
    }

    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    @Autowired JsonMapper json;

    @BeforeEach void clean() { jdbc.update("DELETE FROM training_session"); }

    private String draft() {
        return """
                {"athleteId":"%s","sessionDate":"2026-09-27T15:00:00Z","status":"BORRADOR"}
                """.formatted(ATHLETE);
    }

    private String complete() {
        return """
                {"athleteId":"%s","sessionDate":"2026-09-27T15:00:00Z","status":"COMPLETADA",
                 "technical":{"startSpeedKmh":20,"maxSpeedKmh":40,"averageSpeedKmh":30,"completedLaps":2,
                   "laps":[{"timeSeconds":30.5,"splitSeconds":[15,15.5]},{"timeSeconds":31}],
                   "intervals":[{"fromSecond":0,"toSecond":62,"completedLaps":2}]},
                 "physical":{"resistanceScore":8,"recoverySeconds":120},"observations":"Viento fuerte"}
                """.formatted(ATHLETE);
    }

    private String create(String payload) throws Exception {
        var result = mvc.perform(post("/api/v1/sessions").with(httpBasic("entrenador", PASSWORD))
                .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isCreated()).andExpect(header().exists("Location")).andReturn();
        return json.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }

    @Test void flywayCreatesRealHypertable() {
        assertThat(jdbc.queryForObject("""
                SELECT count(*) FROM timescaledb_information.hypertables
                WHERE hypertable_name='session_metrics'
                """, Integer.class)).isEqualTo(1);
    }

    @Test void persistsAllThreeStoriesAndReturnsAthleteHistory() throws Exception {
        String id = create(complete());
        mvc.perform(get("/api/v1/sessions/" + id).with(httpBasic("entrenador", PASSWORD)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.technical.laps.length()").value(2))
                .andExpect(jsonPath("$.physical.resistanceScore").value(8))
                .andExpect(jsonPath("$.physical.recoverySeconds").value(120))
                .andExpect(jsonPath("$.observations").value("Viento fuerte"))
                .andExpect(jsonPath("$.coachId").value("11111111-1111-1111-1111-111111111111"));
        mvc.perform(get("/api/v1/athletes/" + ATHLETE + "/sessions").with(httpBasic("entrenador", PASSWORD))
                .param("from", "2026-09-01T00:00:00Z").param("to", "2026-10-01T00:00:00Z"))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(id));
    }

    @Test void completesDraftAndMovesTimestampWithoutDuplicateMeasurements() throws Exception {
        String id = create(draft());
        String payload = complete().replace("\"status\":\"COMPLETADA\"", "\"version\":0,\"status\":\"COMPLETADA\"")
                .replace("2026-09-27T15:00:00Z", "2026-10-01T15:00:00Z");
        mvc.perform(put("/api/v1/sessions/" + id).with(httpBasic("entrenador", PASSWORD))
                .contentType(MediaType.APPLICATION_JSON).content(payload))
                .andExpect(status().isOk()).andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.status").value("COMPLETADA"));
        assertThat(jdbc.queryForObject("SELECT count(*) FROM session_metrics WHERE session_id=?",
                Integer.class, UUID.fromString(id))).isEqualTo(1);
        mvc.perform(put("/api/v1/sessions/" + id).with(httpBasic("entrenador", PASSWORD))
                .contentType(MediaType.APPLICATION_JSON).content(payload)).andExpect(status().isConflict());
    }

    @Test void editsAndClearsObservationsWithoutLosingMetrics() throws Exception {
        String id = create(complete());
        mvc.perform(patch("/api/v1/sessions/" + id + "/observations").with(httpBasic("entrenador", PASSWORD))
                .contentType(MediaType.APPLICATION_JSON).content("{\"version\":0,\"observations\":\"Recuperado\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.observations").value("Recuperado"))
                .andExpect(jsonPath("$.technical.completedLaps").value(2));
        mvc.perform(patch("/api/v1/sessions/" + id + "/observations").with(httpBasic("entrenador", PASSWORD))
                .contentType(MediaType.APPLICATION_JSON).content("{\"version\":1,\"observations\":null}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.observations").doesNotExist());
    }

    @Test void agendaIncludesScheduledSessionsAndExcludesDrafts() throws Exception {
        String id = create(draft().replace("BORRADOR", "PROGRAMADA"));
        create(draft());
        for (String team : new String[]{"true", "false"}) {
            mvc.perform(get("/api/v1/agenda").with(httpBasic("entrenador", PASSWORD))
                    .param("from", "2026-09-01T00:00:00Z").param("to", "2026-10-01T00:00:00Z").param("team", team))
                    .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].id").value(id));
        }
    }

    @Test void blocksAnonymousWrongPasswordAndUnassignedAthlete() throws Exception {
        mvc.perform(post("/api/v1/sessions").contentType(MediaType.APPLICATION_JSON).content(draft()))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/sessions").with(httpBasic("entrenador", "incorrecta"))
                .contentType(MediaType.APPLICATION_JSON).content(draft())).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/sessions").with(httpBasic("entrenador", PASSWORD))
                .contentType(MediaType.APPLICATION_JSON).content(draft().replace(ATHLETE, UUID.randomUUID().toString())))
                .andExpect(status().isForbidden());
    }

    @Test void preventsReadingOrEditingSessionAfterAthleteLeavesScope() throws Exception {
        String id = create(complete());
        jdbc.update("UPDATE training_session SET athlete_id=? WHERE id=?", UUID.randomUUID(), UUID.fromString(id));
        mvc.perform(get("/api/v1/sessions/" + id).with(httpBasic("entrenador", PASSWORD)))
                .andExpect(status().isForbidden());
        mvc.perform(patch("/api/v1/sessions/" + id + "/observations").with(httpBasic("entrenador", PASSWORD))
                .contentType(MediaType.APPLICATION_JSON).content("{\"version\":0,\"observations\":\"Prohibido\"}"))
                .andExpect(status().isForbidden());
    }

    @Test void rejectsInvalidPayloadsWithoutPersisting() throws Exception {
        for (String payload : new String[]{
                complete().replace("30.5", "0"), complete().replace("30.5", "\"abc\""),
                complete().replace("\"resistanceScore\":8", "\"resistanceScore\":11"),
                draft().replace("BORRADOR", "COMPLETADA"),
                complete().replace("Viento fuerte", "a".repeat(2001))}) {
            mvc.perform(post("/api/v1/sessions").with(httpBasic("entrenador", PASSWORD))
                    .contentType(MediaType.APPLICATION_JSON).content(payload)).andExpect(status().isBadRequest());
        }
        assertThat(jdbc.queryForObject("SELECT count(*) FROM training_session", Integer.class)).isZero();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM session_metrics", Integer.class)).isZero();
    }

    @Test void rejectsInvalidRangeAndPagination() throws Exception {
        mvc.perform(get("/api/v1/agenda").with(httpBasic("entrenador", PASSWORD))
                .param("from", "2026-10-01T00:00:00Z").param("to", "2026-09-01T00:00:00Z"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/agenda").with(httpBasic("entrenador", PASSWORD))
                .param("from", "2026-09-01T00:00:00Z").param("to", "2026-10-01T00:00:00Z")
                .param("limit", "1000")).andExpect(status().isBadRequest());
    }

    @Test void healthIsPublicAndUnknownSessionReturns404() throws Exception {
        mvc.perform(get("/actuator/health/readiness")).andExpect(status().isOk());
        mvc.perform(get("/api/v1/sessions/" + UUID.randomUUID()).with(httpBasic("entrenador", PASSWORD)))
                .andExpect(status().isNotFound());
    }
}
