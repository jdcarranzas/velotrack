package com.velotrack.talentms;

import com.velotrack.talentms.pubsub.TalentEvents;
import com.velotrack.talentms.dto.SkaterRegistrationRequest;
import com.velotrack.talentms.dto.SkaterResponse;
import com.velotrack.talentms.model.Category;
import com.velotrack.talentms.model.Skater;
import com.velotrack.talentms.model.Team;
import com.velotrack.talentms.model.Venue;
import com.velotrack.talentms.repository.CategoryRepository;
import com.velotrack.talentms.repository.CoachRepository;
import com.velotrack.talentms.repository.CoachTeamRepository;
import com.velotrack.talentms.repository.SkaterRepository;
import com.velotrack.talentms.repository.TeamRepository;
import com.velotrack.talentms.repository.VenueRepository;
import com.velotrack.talentms.service.SkaterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SkaterRegistrationTest {

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
        request.setName("Test Skater");
        request.setIdNumber("12345");
        request.setDateOfBirth(LocalDate.of(2000, 1, 1));
        request.setCategoryId(1);
        request.setTeamId(1);
        request.setVenueId(1);

        Category category = Category.builder().id(1).name("Test Category").build();
        Team team = Team.builder().id(1).name("Test Team").build();
        Venue venue = Venue.builder().id(1).name("Test Venue").build();

        when(skaterRepository.findByIdNumber("12345")).thenReturn(Optional.empty());
        when(categoryRepository.findById(1)).thenReturn(Optional.of(category));
        when(teamRepository.findById(1)).thenReturn(Optional.of(team));
        when(venueRepository.findById(1)).thenReturn(Optional.of(venue));

        Skater savedSkater = Skater.builder()
                .id(100)
                .name("Test Skater")
                .idNumber("12345")
                .dateOfBirth(LocalDate.of(2000, 1, 1))
                .category(category)
                .team(team)
                .venue(venue)
                .build();

        when(skaterRepository.save(any(Skater.class))).thenReturn(savedSkater);

        SkaterResponse response = skaterService.registerSkater(request);

        assertNotNull(response);
        assertEquals(100, response.getId());
        assertEquals("Test Skater", response.getName());
        assertEquals("12345", response.getIdNumber());
        assertEquals(1, response.getCategoryId());
        assertEquals(1, response.getTeamId());
        assertEquals(1, response.getVenueId());
    }

    @Test
    void registerSkater_DuplicateId_ThrowsException() {
        SkaterRegistrationRequest request = new SkaterRegistrationRequest();
        request.setIdNumber("12345");

        when(skaterRepository.findByIdNumber("12345")).thenReturn(Optional.of(Skater.builder().build()));

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            skaterService.registerSkater(request);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("ID number already exists", exception.getReason());
    }

    @Test
    void registerSkater_CategoryNotFound_ThrowsException() {
        SkaterRegistrationRequest request = new SkaterRegistrationRequest();
        request.setIdNumber("12345");
        request.setCategoryId(99);

        when(skaterRepository.findByIdNumber("12345")).thenReturn(Optional.empty());
        when(categoryRepository.findById(99)).thenReturn(Optional.empty());

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> {
            skaterService.registerSkater(request);
        });

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Category not found", exception.getReason());
    }

    @Test
    void getSkatersByTeam_Success() {
        Integer teamId = 1;
        Skater skater1 = Skater.builder()
                .id(1)
                .name("Skater 1")
                .idNumber("123")
                .dateOfBirth(LocalDate.of(2000, 1, 1))
                .category(Category.builder().id(1).build())
                .team(Team.builder().id(1).build())
                .venue(Venue.builder().id(1).build())
                .build();
        Skater skater2 = Skater.builder()
                .id(2)
                .name("Skater 2")
                .idNumber("124")
                .dateOfBirth(LocalDate.of(2000, 2, 2))
                .category(Category.builder().id(1).build())
                .team(Team.builder().id(1).build())
                .venue(Venue.builder().id(1).build())
                .build();

        when(skaterRepository.findByTeamId(teamId)).thenReturn(Arrays.asList(skater1, skater2));

        List<SkaterResponse> responses = skaterService.getSkatersByTeam(teamId);

        assertEquals(2, responses.size());
        assertEquals(1, responses.get(0).getId());
        assertEquals(2, responses.get(1).getId());
    }
}

