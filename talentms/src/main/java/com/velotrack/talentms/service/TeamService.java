package com.velotrack.talentms.service;

import com.velotrack.talentms.dto.TeamRequest;
import com.velotrack.talentms.dto.TeamResponse;
import com.velotrack.talentms.model.Team;
import com.velotrack.talentms.model.Venue;
import com.velotrack.talentms.pubsub.TalentEvents;
import com.velotrack.talentms.repository.TeamRepository;
import com.velotrack.talentms.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final VenueRepository venueRepository;
    private final TalentEvents events;

    @Transactional
    public TeamResponse createTeam(TeamRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team name is required");
        }
        Venue venue = venueRepository.findById(request.getVenueId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Venue not found with id: " + request.getVenueId()));
        if (!Boolean.TRUE.equals(venue.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot create team under inactive venue with id: " + request.getVenueId());
        }
        Team team = Team.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .venueId(venue.getId())
                .isActive(true)
                .build();
        Team saved = teamRepository.save(team);
        events.teamSaved(saved);
        return mapToResponse(saved);
    }

    @Transactional
    public TeamResponse updateTeam(Integer id, TeamRequest request) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Team not found with id: " + id));
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team name is required");
        }
        team.setName(request.getName().trim());
        team.setDescription(request.getDescription());
        Team saved = teamRepository.save(team);
        events.teamSaved(saved);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public TeamResponse getTeamById(Integer id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Team not found with id: " + id));
        return mapToResponse(team);
    }

    @Transactional(readOnly = true)
    public List<TeamResponse> listTeams(Integer venueId, boolean activeOnly) {
        List<Team> teams;
        if (venueId != null) {
            teams = teamRepository.findByVenueId(venueId);
        } else {
            teams = teamRepository.findAll();
        }
        return teams.stream()
                .filter(t -> !activeOnly || Boolean.TRUE.equals(t.getIsActive()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamResponse updateStatus(Integer id, boolean active) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Team not found with id: " + id));
        team.setIsActive(active);
        Team saved = teamRepository.save(team);
        events.teamSaved(saved);
        return mapToResponse(saved);
    }

    private TeamResponse mapToResponse(Team team) {
        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .venueId(team.getVenueId())
                .isActive(team.getIsActive())
                .build();
    }
}
