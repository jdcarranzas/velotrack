package com.velotrack.talentms.controller;

import com.velotrack.talentms.dto.AccessAuditEntryResponse;
import com.velotrack.talentms.dto.CoachAccessResponse;
import com.velotrack.talentms.dto.CoachRegistrationRequest;
import com.velotrack.talentms.dto.CoachResponse;
import com.velotrack.talentms.service.CoachTeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coaches")
@RequiredArgsConstructor
public class CoachController {

    private final CoachTeamService coachTeamService;

    @PostMapping
    public ResponseEntity<CoachResponse> registerCoach(@Valid @RequestBody CoachRegistrationRequest request) {
        CoachResponse response = coachTeamService.registerCoach(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CoachResponse> getCoachById(@PathVariable Integer id) {
        CoachResponse response = coachTeamService.getCoachById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}/teams")
    public ResponseEntity<CoachResponse> assignTeams(@PathVariable Integer id,
                                                     @RequestBody List<Integer> teamIds,
                                                     @RequestHeader(value = "X-Admin-Id", required = false) Integer adminId) {
        CoachResponse response = coachTeamService.assignTeams(id, teamIds, adminId);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}/access")
    public ResponseEntity<CoachAccessResponse> getCoachAccess(@PathVariable Integer id) {
        CoachAccessResponse response = coachTeamService.getCoachAccess(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}/access-history")
    public ResponseEntity<List<AccessAuditEntryResponse>> getAccessHistory(@PathVariable Integer id) {
        List<AccessAuditEntryResponse> history = coachTeamService.getAccessHistory(id);
        return new ResponseEntity<>(history, HttpStatus.OK);
    }
}