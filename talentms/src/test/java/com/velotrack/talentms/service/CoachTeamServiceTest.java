package com.velotrack.talentms.service;

import com.velotrack.talentms.dto.CoachRegistrationRequest;
import com.velotrack.talentms.dto.CoachResponse;
import com.velotrack.talentms.model.Coach;
import com.velotrack.talentms.model.CoachTeam;
import com.velotrack.talentms.model.Team;
import com.velotrack.talentms.model.Venue;
import com.velotrack.talentms.repository.AccessAuditLogRepository;
import com.velotrack.talentms.repository.CoachRepository;
import com.velotrack.talentms.repository.CoachTeamRepository;
import com.velotrack.talentms.repository.TeamRepository;
import com.velotrack.talentms.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CoachTeamServiceTest {
    private CoachTeamService coachTeamService;
    @Mock private CoachRepository coachRepository;
    @Mock private CoachTeamRepository coachTeamRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private AccessAuditLogRepository accessAuditLogRepository;
    @Mock private VenueRepository venueRepository;
    @BeforeEach void setUp() {
        MockitoAnnotations.openMocks(this);
        coachTeamService = new CoachTeamService(coachRepository, coachTeamRepository, teamRepository,
                accessAuditLogRepository, venueRepository);
    }
    @Test void registerCoach_Success_SetsActiveStatus() {
        CoachRegistrationRequest request = CoachRegistrationRequest.builder()
                .name("John Doe").email("john@example.com").password("password123")
                .teamIds(List.of(1, 2)).build();
        Team team1 = Team.builder().id(1).name("Team 1").build();
        Team team2 = Team.builder().id(2).name("Team 2").build();
        when(coachRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(coachRepository.save(any(Coach.class))).thenAnswer(inv -> {
            Coach c = inv.getArgument(0); c.setId(1);
            if (c.getStatus() == null) c.setStatus("active");
            return c;
        });
        when(teamRepository.findById(1)).thenReturn(Optional.of(team1));
        when(teamRepository.findById(2)).thenReturn(Optional.of(team2));
        when(coachTeamRepository.findByCoach(any(Coach.class))).thenReturn(Collections.emptyList());
        CoachResponse response = coachTeamService.registerCoach(request);
        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals("John Doe", response.getName());
        assertEquals("active", response.getStatus());
        verify(coachRepository, times(1)).save(any(Coach.class));
        verify(coachTeamRepository, times(2)).save(any(CoachTeam.class));
    }
    @Test void registerCoach_NoTeams_ThrowsBadRequest() {
        CoachRegistrationRequest request = CoachRegistrationRequest.builder()
                .name("John Doe").email("john@example.com").password("password123")
                .teamIds(Collections.emptyList()).build();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> coachTeamService.registerCoach(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("At least one team assignment is required", ex.getReason());
        verify(coachRepository, never()).save(any(Coach.class));
    }
    @Test void registerCoach_DuplicateEmail_ThrowsBadRequest() {
        CoachRegistrationRequest request = CoachRegistrationRequest.builder()
                .name("John Doe").email("john@example.com").password("password123")
                .teamIds(List.of(1)).build();
        when(coachRepository.findByEmail("john@example.com"))
                .thenReturn(Optional.of(Coach.builder().id(99).email("john@example.com").build()));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> coachTeamService.registerCoach(request));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        assertEquals("Coach with this email already exists", ex.getReason());
    }
    @Test void assignTeams_Success_UpdatesAssociations() {
        Coach coach = Coach.builder().id(1).name("John Doe").email("john@example.com").status("active").build();
        Team team2 = Team.builder().id(2).name("Team 2").build();
        Team team3 = Team.builder().id(3).name("Team 3").build();
        when(coachRepository.findById(1)).thenReturn(Optional.of(coach));
        when(teamRepository.findById(2)).thenReturn(Optional.of(team2));
        when(teamRepository.findById(3)).thenReturn(Optional.of(team3));
        when(coachTeamRepository.findByCoach(coach)).thenReturn(Collections.emptyList());
        CoachResponse response = coachTeamService.assignTeams(1, Arrays.asList(2, 3));
        assertNotNull(response);
        assertEquals(1, response.getId());
        verify(coachTeamRepository, times(1)).deleteByCoach(coach);
        verify(coachTeamRepository, times(2)).save(any(CoachTeam.class));
    }
    @Test void assignTeams_EmptyList_RevokesAllAccess() {
        Coach coach = Coach.builder().id(1).name("John Doe").email("john@example.com").status("active").build();
        Team oldTeam = Team.builder().id(1).name("Team 1").venueId(10).build();
        CoachTeam existing = CoachTeam.builder()
                .id(new CoachTeam.CoachTeamId(1, 1)).coach(coach).team(oldTeam).build();
        when(coachRepository.findById(1)).thenReturn(Optional.of(coach));
        when(teamRepository.findById(1)).thenReturn(Optional.of(oldTeam));
        when(coachTeamRepository.findByCoach(coach)).thenReturn(List.of(existing)).thenReturn(Collections.emptyList());

        CoachResponse response = coachTeamService.assignTeams(1, Collections.emptyList());

        assertNotNull(response);
        assertTrue(response.getTeamIds().isEmpty());
        verify(coachTeamRepository, times(1)).deleteByCoach(coach);
        verify(coachTeamRepository, never()).save(any(CoachTeam.class));
        verify(accessAuditLogRepository, times(1)).save(any());
    }
    @Test void assignTeams_CoachNotFound_ThrowsNotFound() {
        when(coachRepository.findById(99)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> coachTeamService.assignTeams(99, List.of(1)));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
    @Test void assignTeams_Replace_WritesAddedAndRemovedAudit() {
        Coach coach = Coach.builder().id(1).name("John").email("john@example.com").status("active").build();
        Coach admin = Coach.builder().id(9).name("Admin").email("admin@example.com").status("active").build();
        Team t1 = Team.builder().id(1).name("T1").venueId(10).isActive(true).build();
        Team t2 = Team.builder().id(2).name("T2").venueId(10).isActive(true).build();
        Team t3 = Team.builder().id(3).name("T3").venueId(20).isActive(true).build();
        CoachTeam ct1 = CoachTeam.builder().id(new CoachTeam.CoachTeamId(1, 1)).coach(coach).team(t1).build();
        CoachTeam ct2 = CoachTeam.builder().id(new CoachTeam.CoachTeamId(1, 2)).coach(coach).team(t2).build();
        when(coachRepository.findById(1)).thenReturn(Optional.of(coach));
        when(coachRepository.findById(9)).thenReturn(Optional.of(admin));
        when(teamRepository.findById(2)).thenReturn(Optional.of(t2));
        when(teamRepository.findById(3)).thenReturn(Optional.of(t3));
        when(teamRepository.findById(1)).thenReturn(Optional.of(t1));
        when(coachTeamRepository.findByCoach(coach))
                .thenReturn(List.of(ct1, ct2))
                .thenReturn(List.of(
                        CoachTeam.builder().id(new CoachTeam.CoachTeamId(1, 2)).coach(coach).team(t2).build(),
                        CoachTeam.builder().id(new CoachTeam.CoachTeamId(1, 3)).coach(coach).team(t3).build()));

        CoachResponse response = coachTeamService.assignTeams(1, Arrays.asList(2, 3), 9);

        assertNotNull(response);
        assertEquals(2, response.getTeamIds().size());
        verify(coachTeamRepository, times(1)).deleteByCoach(coach);
        verify(coachTeamRepository, times(2)).save(any(CoachTeam.class));
        verify(accessAuditLogRepository, times(2)).save(any());
    }

    @Test void assignTeams_UnknownCoach_WritesNoAudit() {
        when(coachRepository.findById(99)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> coachTeamService.assignTeams(99, List.of(1), null));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        verify(coachTeamRepository, never()).deleteByCoach(any());
        verify(accessAuditLogRepository, never()).save(any());
    }

    @Test void assignTeams_UnknownTeam_WritesNoAudit() {
        Coach coach = Coach.builder().id(1).name("John").email("john@example.com").status("active").build();
        when(coachRepository.findById(1)).thenReturn(Optional.of(coach));
        when(teamRepository.findById(99)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> coachTeamService.assignTeams(1, List.of(99), null));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(coachTeamRepository, never()).deleteByCoach(any());
        verify(accessAuditLogRepository, never()).save(any());
    }

    @Test void assignTeams_NullPerformer_StillUpdates() {
        Coach coach = Coach.builder().id(1).name("John").email("john@example.com").status("active").build();
        Team t2 = Team.builder().id(2).name("T2").venueId(10).isActive(true).build();
        when(coachRepository.findById(1)).thenReturn(Optional.of(coach));
        when(teamRepository.findById(2)).thenReturn(Optional.of(t2));
        when(coachTeamRepository.findByCoach(coach))
                .thenReturn(Collections.emptyList())
                .thenReturn(List.of(CoachTeam.builder().id(new CoachTeam.CoachTeamId(1, 2)).coach(coach).team(t2).build()));

        CoachResponse response = coachTeamService.assignTeams(1, List.of(2), null);

        assertNotNull(response);
        assertEquals(List.of(2), response.getTeamIds());
        verify(accessAuditLogRepository, times(1)).save(any());
    }

    @Test void assignTeams_InactiveTeam_WritesNoAudit() {
        Coach coach = Coach.builder().id(1).name("John").email("john@example.com").status("active").build();
        Team inactive = Team.builder().id(5).name("Old").venueId(10).isActive(false).build();
        when(coachRepository.findById(1)).thenReturn(Optional.of(coach));
        when(teamRepository.findById(5)).thenReturn(Optional.of(inactive));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> coachTeamService.assignTeams(1, List.of(5), null));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(coachTeamRepository, never()).deleteByCoach(any());
        verify(accessAuditLogRepository, never()).save(any());
    }

    @Test void getCoachById_Success() {
        Coach coach = Coach.builder().id(1).name("John Doe").email("john@example.com").status("active").build();
        when(coachRepository.findById(1)).thenReturn(Optional.of(coach));
        when(coachTeamRepository.findByCoach(coach)).thenReturn(Collections.emptyList());
        CoachResponse response = coachTeamService.getCoachById(1);
        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals("active", response.getStatus());
    }

    @Test void getCoachAccess_DerivesVenuesFromTeams() {
        Coach coach = Coach.builder().id(1).name("John").email("john@example.com").status("active").build();
        Team t2 = Team.builder().id(2).name("T2").venueId(10).build();
        Team t3 = Team.builder().id(3).name("T3").venueId(20).build();
        when(coachRepository.findById(1)).thenReturn(Optional.of(coach));
        when(coachTeamRepository.findByCoach(coach)).thenReturn(List.of(
                CoachTeam.builder().id(new CoachTeam.CoachTeamId(1, 2)).coach(coach).team(t2).build(),
                CoachTeam.builder().id(new CoachTeam.CoachTeamId(1, 3)).coach(coach).team(t3).build()));
        when(teamRepository.findById(2)).thenReturn(Optional.of(t2));
        when(teamRepository.findById(3)).thenReturn(Optional.of(t3));

        var access = coachTeamService.getCoachAccess(1);

        assertEquals(1, access.getCoachId());
        assertEquals(2, access.getTeamIds().size());
        assertTrue(access.getVenueIds().contains(10));
        assertTrue(access.getVenueIds().contains(20));
    }
}
