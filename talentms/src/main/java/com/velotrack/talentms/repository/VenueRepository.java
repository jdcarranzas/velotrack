package com.velotrack.talentms.repository;

import com.velotrack.talentms.model.Venue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Integer> {
    List<Venue> findByOrganizationId(Integer organizationId);
}
