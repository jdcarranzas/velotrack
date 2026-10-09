package com.velotrack.talentms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.velotrack.talentms.dto.AccessAuditEntryResponse;
import com.velotrack.talentms.dto.CoachAccessResponse;
import com.velotrack.talentms.dto.CoachRegistrationRequest;
import com.velotrack.talentms.dto.CoachResponse;
import com.velotrack.talentms.service.CoachTeamService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CoachControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CoachTeamService coachTeamService;

    @Test
    void registerCoach_Success() throws Exception {
        CoachRegistrationRequest request = CoachRegistrationRequest.builder()
                .name("John Doe")
                .email("john@example.com")
                .password("password123")
                .teamIds(Arrays.asList(1, 2))
                .build();

        CoachResponse response = CoachResponse.builder()
                .id(1)
                .name("John Doe")
                .email("john@example.com")
                .status("ACTIVE")
                .teamIds(Arrays.asList(1, 2))
                .build();

        when(coachTeamService.registerCoach(any(CoachRegistrationRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/coaches")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.teamIds").isArray());
    }

    @Test
    void assignTeams_Success() throws Exception {
        Integer coachId = 1;
        List<Integer> teamIds = Arrays.asList(1, 2, 3);

        CoachResponse response = CoachResponse.builder()
                .id(coachId)
                .name("John Doe")
                .email("john@example.com")
                .status("ACTIVE")
                .teamIds(teamIds)
                .build();

        when(coachTeamService.assignTeams(any(Integer.class), any(List.class), any())).thenReturn(response);

        mockMvc.perform(put("/api/coaches/{id}/teams", coachId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(teamIds)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(coachId))
                .andExpect(jsonPath("$.teamIds").isArray());
    }

    @Test
    void assignTeams_WithAdminHeader_PassesPerformer() throws Exception {
        Integer coachId = 1;
        List<Integer> teamIds = Collections.emptyList();

        CoachResponse response = CoachResponse.builder()
                .id(coachId)
                .name("John Doe")
                .email("john@example.com")
                .status("active")
                .teamIds(teamIds)
                .build();

        when(coachTeamService.assignTeams(eq(coachId), eq(teamIds), eq(9))).thenReturn(response);

        mockMvc.perform(put("/api/coaches/{id}/teams", coachId)
                .header("X-Admin-Id", 9)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(teamIds)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamIds").isArray());
    }

    @Test
    void assignTeams_EmptyList_RevokesAccess() throws Exception {
        Integer coachId = 1;
        List<Integer> teamIds = Collections.emptyList();

        CoachResponse response = CoachResponse.builder()
                .id(coachId)
                .name("John Doe")
                .email("john@example.com")
                .status("active")
                .teamIds(teamIds)
                .build();

        when(coachTeamService.assignTeams(eq(coachId), eq(teamIds), isNull())).thenReturn(response);

        mockMvc.perform(put("/api/coaches/{id}/teams", coachId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(teamIds)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamIds").isArray())
                .andExpect(jsonPath("$.teamIds").isEmpty());
    }

    @Test
    void getCoachAccess_Success() throws Exception {
        CoachAccessResponse access = CoachAccessResponse.builder()
                .coachId(1)
                .teamIds(Arrays.asList(1, 2))
                .venueIds(List.of(10))
                .build();

        when(coachTeamService.getCoachAccess(1)).thenReturn(access);

        mockMvc.perform(get("/api/coaches/{id}/access", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coachId").value(1))
                .andExpect(jsonPath("$.teamIds").isArray())
                .andExpect(jsonPath("$.venueIds").isArray());
    }

    @Test
    void getAccessHistory_Success() throws Exception {
        AccessAuditEntryResponse entry = AccessAuditEntryResponse.builder()
                .id(1)
                .coachId(1)
                .teamId(2)
                .venueId(10)
                .actionType("ASSIGNED")
                .performedById(9)
                .build();

        when(coachTeamService.getAccessHistory(1)).thenReturn(List.of(entry));

        mockMvc.perform(get("/api/coaches/{id}/access-history", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].actionType").value("ASSIGNED"))
                .andExpect(jsonPath("$[0].performedById").value(9));
    }
}
