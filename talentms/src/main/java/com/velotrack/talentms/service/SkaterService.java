package com.velotrack.talentms.service;

import com.velotrack.talentms.dto.SkaterResponse;
import com.velotrack.talentms.dto.SkaterRegistrationRequest;
import com.velotrack.talentms.model.Category;
import com.velotrack.talentms.model.Coach;
import com.velotrack.talentms.model.Skater;
import com.velotrack.talentms.model.Team;
import com.velotrack.talentms.model.Venue;
import com.velotrack.talentms.pubsub.TalentEvents;
import com.velotrack.talentms.repository.CategoryRepository;
import com.velotrack.talentms.repository.CoachRepository;
import com.velotrack.talentms.repository.CoachTeamRepository;
import com.velotrack.talentms.repository.SkaterRepository;
import com.velotrack.talentms.repository.TeamRepository;
import com.velotrack.talentms.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SkaterService {

    private final SkaterRepository skaterRepository;
    private final CategoryRepository categoryRepository;
    private final TeamRepository teamRepository;
    private final VenueRepository venueRepository;
    private final CoachRepository coachRepository;
    private final CoachTeamRepository coachTeamRepository;
    private final TalentEvents events;

    @Transactional
    public SkaterResponse registerSkater(SkaterRegistrationRequest request) {
        if (skaterRepository.findByIdNumber(request.getIdNumber()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID number already exists");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team not found"));
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Venue not found"));

        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is inactive");
        }
        if (!Boolean.TRUE.equals(team.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team is inactive");
        }
        if (!Boolean.TRUE.equals(venue.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Venue is inactive");
        }

        Skater skater = Skater.builder()
                .name(request.getName())
                .idNumber(request.getIdNumber())
                .dateOfBirth(request.getDateOfBirth())
                .category(category)
                .team(team)
                .venue(venue)
                .build();

        Skater savedSkater = skaterRepository.save(skater);
        events.skaterSaved(savedSkater);

        SkaterResponse response = new SkaterResponse();
        response.setId(savedSkater.getId());
        response.setName(savedSkater.getName());
        response.setIdNumber(savedSkater.getIdNumber());
        response.setDateOfBirth(savedSkater.getDateOfBirth());
        response.setCategoryId(savedSkater.getCategory().getId());
        response.setTeamId(savedSkater.getTeam().getId());
        response.setVenueId(savedSkater.getVenue().getId());
        response.setCreatedAt(savedSkater.getCreatedAt());

        return response;
    }

    public List<SkaterResponse> getSkatersByTeam(Integer teamId) {
        return getSkatersByTeam(teamId, null);
    }

    public List<SkaterResponse> getSkatersByTeam(Integer teamId, Integer requestingCoachId) {
        if (requestingCoachId != null && !hasAccessToTeam(requestingCoachId, teamId)) {
            return List.of();
        }
        List<Skater> skaters = skaterRepository.findByTeamId(teamId);
        return skaters.stream().map(skater -> {
            SkaterResponse response = new SkaterResponse();
            response.setId(skater.getId());
            response.setName(skater.getName());
            response.setIdNumber(skater.getIdNumber());
            response.setDateOfBirth(skater.getDateOfBirth());
            response.setCategoryId(skater.getCategory().getId());
            response.setTeamId(skater.getTeam().getId());
            response.setVenueId(skater.getVenue().getId());
            response.setCreatedAt(skater.getCreatedAt());
            return response;
        }).collect(Collectors.toList());
    }

    private boolean hasAccessToTeam(Integer coachId, Integer teamId) {
        return coachRepository.findById(coachId)
                .map(coach -> coachTeamRepository.findByCoach(coach).stream()
                        .anyMatch(ct -> ct.getTeam() != null && teamId.equals(ct.getTeam().getId())))
                .orElse(false);
    }
}
