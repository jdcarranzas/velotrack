package com.velotrack.talentms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.velotrack.talentms.dto.CategoryRequest;
import com.velotrack.talentms.dto.CoachRegistrationRequest;
import com.velotrack.talentms.dto.SkaterRegistrationRequest;
import com.velotrack.talentms.dto.TeamRequest;
import com.velotrack.talentms.dto.VenueRequest;
import com.velotrack.talentms.model.Organization;
import com.velotrack.talentms.repository.OrganizationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TeamsVenuesFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    void fullFlow_CreateDeactivateAndFilteredLists() throws Exception {
        Organization org = organizationRepository.save(
                Organization.builder().name("Flow Org " + System.nanoTime()).build());

        VenueRequest venueRequest = VenueRequest.builder()
                .name("Main Venue").description("HQ").organizationId(org.getId()).build();
        String venueBody = mockMvc.perform(post("/api/venues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(venueRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andReturn().getResponse().getContentAsString();
        Integer venueId = objectMapper.readTree(venueBody).get("id").asInt();

        Integer teamA = createTeam("Team A", venueId);
        Integer teamB = createTeam("Team B", venueId);

        CategoryRequest categoryRequest = CategoryRequest.builder()
                .name("Cat " + System.nanoTime()).description("Speed").build();
        String categoryBody = mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(categoryRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andReturn().getResponse().getContentAsString();
        Integer categoryId = objectMapper.readTree(categoryBody).get("id").asInt();

        SkaterRegistrationRequest skaterRequest = new SkaterRegistrationRequest();
        skaterRequest.setName("Flow Skater");
        skaterRequest.setIdNumber("FLOW-" + System.nanoTime());
        skaterRequest.setDateOfBirth(LocalDate.of(2010, 5, 1));
        skaterRequest.setCategoryId(categoryId);
        skaterRequest.setTeamId(teamA);
        skaterRequest.setVenueId(venueId);
        mockMvc.perform(post("/api/skaters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(skaterRequest)))
                .andExpect(status().isCreated());

        CoachRegistrationRequest coachRequest = CoachRegistrationRequest.builder()
                .name("Flow Coach").email("flow_" + System.nanoTime() + "@example.com")
                .password("secret123").teamIds(List.of(teamA)).build();
        mockMvc.perform(post("/api/coaches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(coachRequest)))
                .andExpect(status().isCreated());

        mockMvc.perform(patch("/api/teams/{id}/status", teamA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"active\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isActive").value(false));

        SkaterRegistrationRequest rejectedSkater = new SkaterRegistrationRequest();
        rejectedSkater.setName("Rejected Skater");
        rejectedSkater.setIdNumber("REJ-" + System.nanoTime());
        rejectedSkater.setDateOfBirth(LocalDate.of(2011, 6, 2));
        rejectedSkater.setCategoryId(categoryId);
        rejectedSkater.setTeamId(teamA);
        rejectedSkater.setVenueId(venueId);
        mockMvc.perform(post("/api/skaters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectedSkater)))
                .andExpect(status().isBadRequest());

        CoachRegistrationRequest rejectedCoach = CoachRegistrationRequest.builder()
                .name("Rejected Coach").email("rej_" + System.nanoTime() + "@example.com")
                .password("secret123").teamIds(List.of(teamA)).build();
        mockMvc.perform(post("/api/coaches")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejectedCoach)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/teams").param("venueId", String.valueOf(venueId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id").value(teamB));
        mockMvc.perform(get("/api/teams").param("venueId", String.valueOf(venueId))
                        .param("activeOnly", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
        mockMvc.perform(get("/api/venues").param("organizationId", String.valueOf(org.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + venueId + ")]", hasSize(1)));
    }

    private Integer createTeam(String name, Integer venueId) throws Exception {
        TeamRequest request = TeamRequest.builder()
                .name(name + " " + System.nanoTime()).description("desc").venueId(venueId).build();
        String body = mockMvc.perform(post("/api/teams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asInt();
    }

    @Test
    void venueValidation_UnknownOrg_Returns404() throws Exception {
        VenueRequest request = VenueRequest.builder()
                .name("Bad Venue").organizationId(999999).build();
        mockMvc.perform(post("/api/venues")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }
}
