package com.velotrack.talentms.repository;

import com.velotrack.talentms.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, Integer> {
    java.util.List<Team> findByVenueId(Integer venueId);
}
