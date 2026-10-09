package com.velotrack.talentms.controller;

import com.velotrack.talentms.dto.StatusUpdateRequest;
import com.velotrack.talentms.dto.VenueRequest;
import com.velotrack.talentms.dto.VenueResponse;
import com.velotrack.talentms.service.VenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
@RequiredArgsConstructor
public class VenueController {

    private final VenueService venueService;

    @PostMapping
    public ResponseEntity<VenueResponse> createVenue(@Valid @RequestBody VenueRequest request) {
        VenueResponse response = venueService.createVenue(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<VenueResponse>> listVenues(
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false, defaultValue = "true") boolean activeOnly) {
        List<VenueResponse> venues = venueService.listVenues(organizationId, activeOnly);
        return new ResponseEntity<>(venues, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> getVenueById(@PathVariable Integer id) {
        VenueResponse response = venueService.getVenueById(id);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VenueResponse> updateVenue(
            @PathVariable Integer id, @Valid @RequestBody VenueRequest request) {
        VenueResponse response = venueService.updateVenue(id, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<VenueResponse> updateStatus(
            @PathVariable Integer id, @Valid @RequestBody StatusUpdateRequest request) {
        VenueResponse response = venueService.updateStatus(id, request.getActive());
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
