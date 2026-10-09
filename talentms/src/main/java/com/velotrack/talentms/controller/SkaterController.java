package com.velotrack.talentms.controller;

import com.velotrack.talentms.dto.SkaterResponse;
import com.velotrack.talentms.dto.SkaterRegistrationRequest;
import com.velotrack.talentms.service.SkaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/skaters")
@RequiredArgsConstructor
public class SkaterController {

    private final SkaterService skaterService;

    @PostMapping
    public ResponseEntity<SkaterResponse> registerSkater(@RequestBody SkaterRegistrationRequest request) {
        SkaterResponse response = skaterService.registerSkater(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SkaterResponse>> getSkatersByTeam(@RequestParam Integer teamId,
                                                                @RequestParam(required = false) Integer coachId) {
        List<SkaterResponse> skaters = skaterService.getSkatersByTeam(teamId, coachId);
        return new ResponseEntity<>(skaters, HttpStatus.OK);
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<List<SkaterResponse>> getSkatersByTeamPath(@PathVariable Integer teamId,
                                                                    @RequestParam(required = false) Integer coachId) {
        List<SkaterResponse> skaters = skaterService.getSkatersByTeam(teamId, coachId);
        return new ResponseEntity<>(skaters, HttpStatus.OK);
    }
}
