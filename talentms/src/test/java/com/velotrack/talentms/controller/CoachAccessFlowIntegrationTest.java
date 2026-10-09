package com.velotrack.talentms.controller;

import com.fasterxml.jackson.databind.JsonNode;
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
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CoachAccessFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Test
    void fullFlow_ReplaceRevokeAuditAndScopedReads() throws Exception {
        long stamp = System.nanoTime();
        Organization org = organizationRepository.save(
                Organization.builder().name("HU4 Org " + stamp).build());
        Integer venueId = createVenue("HU4 Venue " + stamp, org.getId());
        Integer teamA = createTeam("HU4 Team A " + stamp, venueId);
        Integer teamB = createTeam("HU4 Team B " + stamp, venueId);
        Integer categoryId = createCategory("HU4 Cat " + stamp);
        Integer adminId = registerCoach("HU4 Admin", "hu4adm_" + stamp + "@e.com", List.of(teamA));
        Integer coachId = registerCoach("HU4 Coach", "hu4coach_" + stamp + "@e.com", List.of(teamA));
        registerSkater("HU4 Skater", "HU4-" + stamp, categoryId, teamA, venueId);

        mockMvc.perform(get("/api/skaters/{teamId}", teamA).param("coachId", String.valueOf(coachId)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1));
        mockMvc.perform(get("/api/skaters").param("teamId", String.valueOf(teamB))
                        .param("coachId", String.valueOf(coachId)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(put("/api/coaches/{id}/teams", coachId).header("X-Admin-Id", adminId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(teamB))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.teamIds[0]").value(teamB));

        mockMvc.perform(get("/api/coaches/{id}/access", coachId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamIds[0]").value(teamB))
                .andExpect(jsonPath("$.venueIds[0]").value(venueId));
        mockMvc.perform(get("/api/skaters/{teamId}", teamA).param("coachId", String.valueOf(coachId)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));

        MvcResult afterReplace = mockMvc.perform(get("/api/coaches/{id}/access-history", coachId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2)).andReturn();
        JsonNode replaceRows = objectMapper.readTree(afterReplace.getResponse().getContentAsString());
        assertTrue(hasRow(replaceRows, "REMOVED", teamA, adminId));
        assertTrue(hasRow(replaceRows, "ASSIGNED", teamB, adminId));
        replaceRows.forEach(row -> assertNotNull(row.get("changedAt").asText(null)));
        checkRevoke(coachId, adminId, teamA, teamB);
    }

    private void checkRevoke(Integer coachId, Integer adminId, Integer teamA, Integer teamB) throws Exception {
        mockMvc.perform(put("/api/coaches/{id}/teams", coachId).header("X-Admin-Id", adminId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of())))
                .andExpect(status().isOk()).andExpect(jsonPath("$.teamIds").isEmpty());
        mockMvc.perform(get("/api/skaters/{teamId}", teamB).param("coachId", String.valueOf(coachId)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(get("/api/coaches/{id}/access", coachId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teamIds").isEmpty())
                .andExpect(jsonPath("$.venueIds").isEmpty());
        MvcResult afterRevoke = mockMvc.perform(get("/api/coaches/{id}/access-history", coachId))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(3)).andReturn();
        JsonNode revokeRows = objectMapper.readTree(afterRevoke.getResponse().getContentAsString());
        assertTrue(hasRow(revokeRows, "REMOVED", teamB, adminId));
        assertFalse(hasRow(revokeRows, "ASSIGNED", teamA, adminId));
    }

    private boolean hasRow(JsonNode rows, String action, Integer teamId, Integer performerId) {
        for (JsonNode row : rows) {
            if (action.equals(row.path("actionType").asText())
                    && teamId.equals(row.path("teamId").asInt())
                    && performerId.equals(row.path("performedById").asInt())) {
                return true;
            }
        }
        return false;
    }

    private Integer createVenue(String name, Integer orgId) throws Exception {
        VenueRequest request = VenueRequest.builder().name(name).organizationId(orgId).build();
        String body = mockMvc.perform(post("/api/venues").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asInt();
    }

    private Integer createTeam(String name, Integer venueId) throws Exception {
        TeamRequest request = TeamRequest.builder().name(name).venueId(venueId).build();
        String body = mockMvc.perform(post("/api/teams").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asInt();
    }

    private Integer createCategory(String name) throws Exception {
        CategoryRequest request = CategoryRequest.builder().name(name).build();
        String body = mockMvc.perform(post("/api/categories").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asInt();
    }

    private Integer registerCoach(String name, String email, List<Integer> teamIds) throws Exception {
        CoachRegistrationRequest request = CoachRegistrationRequest.builder()
                .name(name).email(email).password("secret123").teamIds(teamIds).build();
        String body = mockMvc.perform(post("/api/coaches").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("id").asInt();
    }

    private void registerSkater(String name, String idNumber, Integer categoryId,
                                Integer teamId, Integer venueId) throws Exception {
        SkaterRegistrationRequest skater = new SkaterRegistrationRequest();
        skater.setName(name);
        skater.setIdNumber(idNumber);
        skater.setDateOfBirth(LocalDate.of(2012, 3, 4));
        skater.setCategoryId(categoryId);
        skater.setTeamId(teamId);
        skater.setVenueId(venueId);
        mockMvc.perform(post("/api/skaters").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(skater)))
                .andExpect(status().isCreated());
    }
}
