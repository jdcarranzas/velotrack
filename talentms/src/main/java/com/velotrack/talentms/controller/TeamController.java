package com.velotrack.talentms.controller;

import com.velotrack.talentms.dto.StatusUpdateRequest;
import com.velotrack.talentms.dto.TeamRequest;
import com.velotrack.talentms.dto.TeamResponse;
import com.velotrack.talentms.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@Valid @RequestBody TeamRequest request) {
        TeamResponse response = teamService.createTeam(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TeamResponse>> listTeams(
            @RequestParam(required = false) Integer venueId,
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly) {
        List<TeamResponse> teams = teamService.listTeams(venueId, activeOnly);
        return new ResponseEntity<>(teams, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getTeamById(@PathVariable Integer id) {
        TeamResponse response = teamService.getTeamById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable Integer id, @Valid @RequestBody TeamRequest request) {
        TeamResponse response = teamService.updateTeam(id, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TeamResponse> updateStatus(
            @PathVariable Integer id, @Valid @RequestBody StatusUpdateRequest request) {
        TeamResponse response = teamService.updateStatus(id, request.getActive());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
