package com.velotrack.talentms.service;

import com.velotrack.talentms.dto.AccessAuditEntryResponse;
import com.velotrack.talentms.dto.CoachAccessResponse;
import com.velotrack.talentms.dto.CoachRegistrationRequest;
import com.velotrack.talentms.dto.CoachResponse;
import com.velotrack.talentms.model.AccessAuditLog;
import com.velotrack.talentms.model.Coach;
import com.velotrack.talentms.model.CoachTeam;
import com.velotrack.talentms.model.Team;
import com.velotrack.talentms.pubsub.TalentEvents;
import com.velotrack.talentms.repository.AccessAuditLogRepository;
import com.velotrack.talentms.repository.CoachRepository;
import com.velotrack.talentms.repository.CoachTeamRepository;
import com.velotrack.talentms.repository.TeamRepository;
import com.velotrack.talentms.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CoachTeamService {

    private final CoachRepository coachRepository;
    private final CoachTeamRepository coachTeamRepository;
    private final TeamRepository teamRepository;
    private final AccessAuditLogRepository accessAuditLogRepository;
    private final VenueRepository venueRepository;
    private final TalentEvents events;

    @Transactional
    public CoachResponse registerCoach(CoachRegistrationRequest request) {
        if (request.getTeamIds() == null || request.getTeamIds().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one team assignment is required");
        }

        if (coachRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coach with this email already exists");
        }

        Coach coach = Coach.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(request.getPassword())
                .status("active")
                .build();

        Coach savedCoach = coachRepository.save(coach);

        for (Integer teamId : request.getTeamIds()) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team not found with id: " + teamId));

            if (!Boolean.TRUE.equals(team.getIsActive())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team is inactive with id: " + teamId);
            }

            CoachTeam coachTeam = CoachTeam.builder()
                    .id(new CoachTeam.CoachTeamId(savedCoach.getId(), team.getId()))
                    .coach(savedCoach)
                    .team(team)
                    .build();
            coachTeamRepository.save(coachTeam);
        }

        events.coachSaved(savedCoach);
        events.coachTeamsSaved(savedCoach.getId(), request.getTeamIds());
        return mapToResponse(savedCoach);
    }

    @Transactional(readOnly = true)
    public CoachResponse getCoachById(Integer coachId) {
        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));
        return mapToResponse(coach);
    }

    @Transactional(readOnly = true)
    public boolean hasCoach(Integer teamId) {
        return coachTeamRepository.existsByTeamId(teamId);
    }

    @Transactional
    public CoachResponse assignTeams(Integer coachId, List<Integer> teamIds) {
        return assignTeams(coachId, teamIds, null);
    }

    @Transactional
    public CoachResponse assignTeams(Integer coachId, List<Integer> teamIds, Integer performedById) {
        List<Integer> newTeamIds = teamIds == null ? List.of() : teamIds.stream().distinct().toList();

        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));

        Coach performedBy = null;
        if (performedById != null) {
            performedBy = coachRepository.findById(performedById)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Performing coach not found with id: " + performedById));
        }

        // Validate the full new set BEFORE mutating so rejected updates leave no audit rows.
        Map<Integer, Team> resolvedTeams = new HashMap<>();
        for (Integer teamId : newTeamIds) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team not found with id: " + teamId));

            if (!Boolean.TRUE.equals(team.getIsActive())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team is inactive with id: " + teamId);
            }
            resolvedTeams.put(teamId, team);
        }

        Set<Integer> previousTeamIds = new HashSet<>(coachTeamRepository.findByCoach(coach).stream()
                .map(ct -> ct.getTeam().getId())
                .toList());
        Set<Integer> newTeamIdSet = new HashSet<>(newTeamIds);

        Set<Integer> added = new HashSet<>(newTeamIdSet);
        added.removeAll(previousTeamIds);
        Set<Integer> removed = new HashSet<>(previousTeamIds);
        removed.removeAll(newTeamIdSet);

        // Remove old associations
        coachTeamRepository.deleteByCoach(coach);
        coachTeamRepository.flush();

        // Add new associations
        for (Integer teamId : newTeamIds) {
            Team team = resolvedTeams.get(teamId);
            CoachTeam coachTeam = CoachTeam.builder()
                    .id(new CoachTeam.CoachTeamId(coach.getId(), team.getId()))
                    .coach(coach)
                    .team(team)
                    .build();
            coachTeamRepository.save(coachTeam);
        }

        // Audit each delta row in the same transaction.
        for (Integer teamId : added) {
            writeAuditRow(coach, resolvedTeams.get(teamId), "ASSIGNED", performedBy);
        }
        for (Integer teamId : removed) {
            Team team = teamRepository.findById(teamId).orElse(null);
            writeAuditRow(coach, team, "REMOVED", performedBy);
        }

        events.coachTeamsSaved(coach.getId(), newTeamIds);

        return mapToResponse(coach);
    }

    @Transactional(readOnly = true)
    public CoachAccessResponse getCoachAccess(Integer coachId) {
        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));
        List<Integer> teamIds = currentTeamIds(coach);
        List<Integer> venueIds = resolveVenueIds(teamIds);
        return CoachAccessResponse.builder()
                .coachId(coach.getId())
                .teamIds(teamIds)
                .venueIds(venueIds)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AccessAuditEntryResponse> getAccessHistory(Integer coachId) {
        if (!coachRepository.existsById(coachId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found");
        }
        return accessAuditLogRepository.findByCoachIdOrderByChangedAtDesc(coachId).stream()
                .map(this::mapAuditToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Integer> getAssignedTeamIds(Integer coachId) {
        Coach coach = coachRepository.findById(coachId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Coach not found"));
        return currentTeamIds(coach);
    }

    private CoachResponse mapToResponse(Coach coach) {
        List<Integer> teamIds = currentTeamIds(coach);

        return CoachResponse.builder()
                .id(coach.getId())
                .name(coach.getName())
                .email(coach.getEmail())
                .status(coach.getStatus())
                .teamIds(teamIds)
                .build();
    }

    private List<Integer> currentTeamIds(Coach coach) {
        return coachTeamRepository.findByCoach(coach).stream()
                .map(ct -> ct.getTeam().getId())
                .toList();
    }

    private List<Integer> resolveVenueIds(List<Integer> teamIds) {
        List<Integer> venueIds = new ArrayList<>();
        for (Integer teamId : teamIds) {
            teamRepository.findById(teamId).ifPresent(team -> {
                if (team.getVenueId() != null && !venueIds.contains(team.getVenueId())) {
                    venueIds.add(team.getVenueId());
                }
            });
        }
        return venueIds;
    }

    private void writeAuditRow(Coach coach, Team team, String actionType, Coach performedBy) {
        AccessAuditLog entry = AccessAuditLog.builder()
                .coach(coach)
                .team(team)
                .venue(team != null && team.getVenueId() != null
                        ? venueRepository.findById(team.getVenueId()).orElse(null)
                        : null)
                .actionType(actionType)
                .performedBy(performedBy)
                .build();
        AccessAuditLog saved = accessAuditLogRepository.save(entry);
        events.accessAuditLogged(saved);
    }

    private AccessAuditEntryResponse mapAuditToResponse(AccessAuditLog entry) {
        return AccessAuditEntryResponse.builder()
                .id(entry.getId())
                .coachId(entry.getCoach() != null ? entry.getCoach().getId() : null)
                .teamId(entry.getTeam() != null ? entry.getTeam().getId() : null)
                .venueId(entry.getVenue() != null ? entry.getVenue().getId() : null)
                .actionType(entry.getActionType())
                .performedById(entry.getPerformedBy() != null ? entry.getPerformedBy().getId() : null)
                .changedAt(entry.getChangedAt())
                .build();
    }
}
