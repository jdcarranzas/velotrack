package co.velotrack.captura.session;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(SessionController.class)
@Import(ApiExceptionHandler.class)
class SessionControllerTest {
    @Autowired MockMvc mvc;
    @MockitoBean SessionService service;
    private static final String DRAFT = """
            {"athleteId":"33333333-3333-3333-3333-333333333333",
             "sessionDate":"2026-09-27T15:00:00Z","status":"BORRADOR"}
            """;

    @Test void createsSessionAndSetsLocation() throws Exception {
        UUID id = UUID.randomUUID();
        var now = Instant.parse("2026-09-27T15:00:00Z");
        var session = new TrainingSession(id, UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                now, SessionStatus.BORRADOR, null, null, null, 0, now, now);
        when(service.create(any())).thenReturn(session);
        mvc.perform(post("/api/v1/sessions")                .contentType(MediaType.APPLICATION_JSON).content(DRAFT))
                .andExpect(status().isCreated()).andExpect(header().string("Location", "/api/v1/sessions/" + id))
                .andExpect(jsonPath("$.sessionDate").value("2026-09-27T15:00:00Z"));
        verify(service).create(any());
    }

    @Test void rejectsInvalidMetricsBeforeBusinessLogic() throws Exception {
        String body = DRAFT.replace("\"status\":\"BORRADOR\"",
                "\"status\":\"BORRADOR\",\"technical\":{\"laps\":[{\"timeSeconds\":0}]}");
        mvc.perform(post("/api/v1/sessions")                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors[0].field").exists());
        verifyNoInteractions(service);
    }

    @Test void rejectsNonNumericTimes() throws Exception {
        String body = DRAFT.replace("\"status\":\"BORRADOR\"",
                "\"status\":\"BORRADOR\",\"technical\":{\"laps\":[{\"timeSeconds\":\"abc\"}]}");
        mvc.perform(post("/api/v1/sessions")                .contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test void rejectsInvalidPhysicalIndicatorAndExcessiveText() throws Exception {
        String body = DRAFT.replace("\"status\":\"BORRADOR\"",
                "\"status\":\"BORRADOR\",\"physical\":{\"resistanceScore\":11},\"observations\":\"" + "a".repeat(2001) + "\"");
        mvc.perform(post("/api/v1/sessions")                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.length()").value(2));
        verifyNoInteractions(service);
    }

    @Test void rejectsUnknownFieldsAndMissingVersionOnPatch() throws Exception {
        mvc.perform(post("/api/v1/sessions")                .contentType(MediaType.APPLICATION_JSON).content(DRAFT.replace("\"status\":\"BORRADOR\"",
                        "\"status\":\"BORRADOR\",\"coachId\":\"spoofed\"")))
                .andExpect(status().isBadRequest());
        mvc.perform(patch("/api/v1/sessions/" + UUID.randomUUID() + "/observations")                .contentType(MediaType.APPLICATION_JSON).content("{\"observations\":\"Texto\"}"))
                .andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }

    @Test void rejectsUnboundedListLimit() throws Exception {
        mvc.perform(get("/api/v1/agenda")                .param("from", "2026-09-01T00:00:00Z").param("to", "2026-10-01T00:00:00Z")
                .param("limit", "1000")).andExpect(status().isBadRequest());
        verifyNoInteractions(service);
    }
}
