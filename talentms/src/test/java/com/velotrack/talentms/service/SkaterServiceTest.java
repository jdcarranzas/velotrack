package com.velotrack.talentms.service;

import com.velotrack.talentms.pubsub.TalentEvents;
import com.velotrack.talentms.dto.SkaterRegistrationRequest;
import com.velotrack.talentms.dto.SkaterResponse;
import com.velotrack.talentms.model.Category;
import com.velotrack.talentms.model.Skater;
import com.velotrack.talentms.model.Team;
import com.velotrack.talentms.model.Venue;
import com.velotrack.talentms.model.Coach;
import com.velotrack.talentms.model.CoachTeam;
import com.velotrack.talentms.repository.CategoryRepository;
import com.velotrack.talentms.repository.CoachRepository;
import com.velotrack.talentms.repository.CoachTeamRepository;
import com.velotrack.talentms.repository.SkaterRepository;
import com.velotrack.talentms.repository.TeamRepository;
import com.velotrack.talentms.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SkaterServiceTest {

    private SkaterService skaterService;

    @Mock
    private SkaterRepository skaterRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private CoachRepository coachRepository;

    @Mock
    private CoachTeamRepository coachTeamRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        skaterService = new SkaterService(skaterRepository, categoryRepository, teamRepository, venueRepository,
                coachRepository, coachTeamRepository, mock(TalentEvents.class));
    }

    @Test
    void registerSkater_Success() {
        SkaterRegistrationRequest request = new SkaterRegistrationRequest();
        request.setName("John Doe");
        request.setIdNumber("12345");
        request.setDateOfBirth(LocalDate.of(2000, 1, 1));
        request.setCategoryId(1);
        request.setTeamId(1);
        request.setVenueId(1);

        Category category = Category.builder().id(1).build();
        Team team = Team.builder().id(1).build();
        Venue venue = Venue.builder().id(1).build();

        when(skaterRepository.findByIdNumber(any())).thenReturn(Optional.empty());
        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        when(teamRepository.findById(1)).thenReturn(Optional.of(team));
        when(venueRepository.findById(1)).thenReturn(Optional.of(venue));
        when(skaterRepository.save(any(Skater.class))).thenAnswer(invocation -> {
            Skater skater = invocation.getArgument(0);
            skater.setId(1);
            skater.setCreatedAt(OffsetDateTime.now());
            return skater;
        });

        SkaterResponse response = skaterService.registerSkater(request);

        assertNotNull(response);
        assertEquals(1, response.getId());
        assertEquals("John Doe", response.getName());
        assertEquals("12345", response.getIdNumber());
        verify(skaterRepository, times(1)).save(any(Skater.class));
    }

    @Test
    void registerSkater_DuplicateId_ThrowsException() {
        SkaterRegistrationRequest request = new SkaterRegistrationRequest();
        request.setIdNumber("12345");

        when(skaterRepository.findByIdNumber("12345")).thenReturn(Optional.of(new Skater()));

        assertThrows(ResponseStatusException.class, () -> skaterService.registerSkater(request));
    }

    @Test
    void getSkatersByTeam_Success() {
        Integer teamId = 1;
        Skater skater = Skater.builder()
                .id(1)
                .name("John Doe")
                .idNumber("12345")
                .dateOfBirth(LocalDate.of(2000, 1, 1))
                .category(Category.builder().id(1).build())
                .team(Team.builder().id(1).build())
                .venue(Venue.builder().id(1).build())
                .createdAt(OffsetDateTime.now())
                .build();

        when(skaterRepository.findByTeamId(teamId)).thenReturn(List.of(skater));

        List<SkaterResponse> responses = skaterService.getSkatersByTeam(teamId);

        assertEquals(1, responses.size());
        assertEquals("John Doe", responses.get(0).getName());
        assertEquals(1, responses.get(0).getTeamId());
    }

    @Test
    void getSkatersByTeam_CoachWithoutTeams_ReturnsEmpty() {
        Coach coach = Coach.builder().id(7).name("No Access").email("noaccess@example.com").status("active").build();
        when(coachRepository.findById(7)).thenReturn(Optional.of(coach));
        when(coachTeamRepository.findByCoach(coach)).thenReturn(Collections.emptyList());

        List<SkaterResponse> responses = skaterService.getSkatersByTeam(1, 7);

        assertTrue(responses.isEmpty());
        verify(skaterRepository, never()).findByTeamId(any());
    }

    @Test
    void getSkatersByTeam_ForeignTeam_ReturnsEmpty() {
        Coach coach = Coach.builder().id(7).name("Coach").email("coach@example.com").status("active").build();
        Team assigned = Team.builder().id(2).name("Assigned").build();
        when(coachRepository.findById(7)).thenReturn(Optional.of(coach));
        when(coachTeamRepository.findByCoach(coach)).thenReturn(List.of(
                CoachTeam.builder().id(new CoachTeam.CoachTeamId(7, 2)).coach(coach).team(assigned).build()));

        List<SkaterResponse> responses = skaterService.getSkatersByTeam(1, 7);

        assertTrue(responses.isEmpty());
        verify(skaterRepository, never()).findByTeamId(any());
    }

    @Test
    void getSkatersByTeam_AssignedTeam_ReturnsSkaters() {
        Coach coach = Coach.builder().id(7).name("Coach").email("coach@example.com").status("active").build();
        Team assigned = Team.builder().id(1).name("Assigned").build();
        when(coachRepository.findById(7)).thenReturn(Optional.of(coach));
        when(coachTeamRepository.findByCoach(coach)).thenReturn(List.of(
                CoachTeam.builder().id(new CoachTeam.CoachTeamId(7, 1)).coach(coach).team(assigned).build()));
        Skater skater = Skater.builder()
                .id(1)
                .name("John Doe")
                .idNumber("12345")
                .dateOfBirth(LocalDate.of(2000, 1, 1))
                .category(Category.builder().id(1).build())
                .team(Team.builder().id(1).build())
                .venue(Venue.builder().id(1).build())
                .createdAt(OffsetDateTime.now())
                .build();
        when(skaterRepository.findByTeamId(1)).thenReturn(List.of(skater));

        List<SkaterResponse> responses = skaterService.getSkatersByTeam(1, 7);

        assertEquals(1, responses.size());
        assertEquals("John Doe", responses.get(0).getName());
    }
}