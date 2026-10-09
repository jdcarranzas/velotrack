package com.velotrack.talentms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.velotrack.talentms.dto.SkaterResponse;
import com.velotrack.talentms.service.SkaterService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SkaterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SkaterService skaterService;

    @Test
    void getSkaters_QueryParams_ScopedToCoach() throws Exception {
        when(skaterService.getSkatersByTeam(eq(5), eq(7))).thenReturn(List.of());

        mockMvc.perform(get("/api/skaters").param("teamId", "5").param("coachId", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void getSkaters_PathVariable_StillWorks() throws Exception {
        SkaterResponse skater = new SkaterResponse();
        skater.setId(1);
        skater.setName("Scoped Skater");
        skater.setTeamId(5);
        when(skaterService.getSkatersByTeam(eq(5), isNull())).thenReturn(List.of(skater));

        mockMvc.perform(get("/api/skaters/{teamId}", 5))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Scoped Skater"));
    }

    @Test
    void getSkaters_PathVariable_WithCoachParam() throws Exception {
        when(skaterService.getSkatersByTeam(eq(5), eq(7))).thenReturn(List.of());

        mockMvc.perform(get("/api/skaters/{teamId}", 5).param("coachId", "7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
