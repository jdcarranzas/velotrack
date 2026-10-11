package com.velotrack.talentms.service;

import com.velotrack.talentms.dto.VenueRequest;
import com.velotrack.talentms.dto.VenueResponse;
import com.velotrack.talentms.model.Organization;
import com.velotrack.talentms.model.Venue;
import com.velotrack.talentms.pubsub.TalentEvents;
import com.velotrack.talentms.repository.OrganizationRepository;
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
public class VenueService {

    private final VenueRepository venueRepository;
    private final OrganizationRepository organizationRepository;
    private final TalentEvents events;

    @Transactional
    public VenueResponse createVenue(VenueRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Venue name is required");
        }
        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Organization not found with id: " + request.getOrganizationId()));

        Venue venue = Venue.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .organizationId(organization.getId())
                .isActive(true)
                .build();
        Venue saved = venueRepository.save(venue);
        events.venueSaved(saved);
        return mapToResponse(saved);
    }

    @Transactional
    public VenueResponse updateVenue(Integer id, VenueRequest request) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Venue not found with id: " + id));
        if (request.getName() == null || request.getName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Venue name is required");
        }
        venue.setName(request.getName().trim());
        venue.setDescription(request.getDescription());
        Venue saved = venueRepository.save(venue);
        events.venueSaved(saved);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public VenueResponse getVenueById(Integer id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Venue not found with id: " + id));
        return mapToResponse(venue);
    }

    @Transactional(readOnly = true)
    public List<VenueResponse> listVenues(Integer organizationId, boolean activeOnly) {
        List<Venue> venues;
        if (organizationId != null) {
            venues = venueRepository.findByOrganizationId(organizationId);
        } else {
            venues = venueRepository.findAll();
        }
        return venues.stream()
                .filter(v -> !activeOnly || Boolean.TRUE.equals(v.getIsActive()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VenueResponse updateStatus(Integer id, boolean active) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Venue not found with id: " + id));
        venue.setIsActive(active);
        Venue saved = venueRepository.save(venue);
        events.venueSaved(saved);
        return mapToResponse(saved);
    }

    private VenueResponse mapToResponse(Venue venue) {
        return VenueResponse.builder()
                .id(venue.getId())
                .name(venue.getName())
                .description(venue.getDescription())
                .organizationId(venue.getOrganizationId())
                .isActive(venue.getIsActive())
                .build();
    }
}
