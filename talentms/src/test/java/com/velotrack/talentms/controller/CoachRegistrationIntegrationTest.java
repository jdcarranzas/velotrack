package com.velotrack.talentms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.velotrack.talentms.dto.CoachRegistrationRequest;
import com.velotrack.talentms.model.Team;
import com.velotrack.talentms.model.Venue;
import com.velotrack.talentms.model.Organization;
import com.velotrack.talentms.repository.TeamRepository;
import com.velotrack.talentms.repository.VenueRepository;
import com.velotrack.talentms.repository.OrganizationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CoachRegistrationIntegrationTest {
    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private TeamRepository teamRepository;
    @Autowired private VenueRepository venueRepository;
    @Autowired private OrganizationRepository organizationRepository;
    private Integer teamId;
    @BeforeEach void setUp() {
        if (teamRepository.count() == 0) {
            Organization org = organizationRepository.save(Organization.builder().name("Test Org").build());
            Venue venue = venueRepository.save(Venue.builder().organizationId(org.getId()).name("Test Venue").build());
            Team team = teamRepository.save(Team.builder().venueId(venue.getId()).name("Team A").build());
            teamId = team.getId();
        } else {
            teamId = teamRepository.findAll().get(0).getId();
        }
    }
    @Test void registerCoach_Success_ReturnsActive() throws Exception {
        CoachRegistrationRequest request = CoachRegistrationRequest.builder()
                .name("Coach One").email("coach1_" + System.nanoTime() + "@example.com")
                .password("secret123").teamIds(List.of(teamId)).build();
        mockMvc.perform(post("/api/coaches").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.status").value("active"))
                .andExpect(jsonPath("$.teamIds").isArray());
    }
    @Test void registerCoach_NoTeams_ReturnsBadRequest() throws Exception {
        String body = "{\"name\":\"No Team\",\"email\":\"noteam_" + System.nanoTime() + "@example.com\",\"password\":\"secret123\",\"teamIds\":[]}";
        mockMvc.perform(post("/api/coaches").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }
    @Test void assignTeams_AndGetCoach_Success() throws Exception {
        CoachRegistrationRequest request = CoachRegistrationRequest.builder()
                .name("Coach Two").email("coach2_" + System.nanoTime() + "@example.com")
                .password("secret123").teamIds(List.of(teamId)).build();
        String reg = mockMvc.perform(post("/api/coaches").contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Integer coachId = objectMapper.readTree(reg).get("id").asInt();
        mockMvc.perform(put("/api/coaches/{id}/teams", coachId).contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(List.of(teamId))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamIds").isArray());
        mockMvc.perform(get("/api/coaches/{id}", coachId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(coachId));
    }
}
