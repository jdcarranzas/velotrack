package com.velotrack.talentms.repository;

import com.velotrack.talentms.model.Skater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkaterRepository extends JpaRepository<Skater, Integer> {
    Optional<Skater> findByIdNumber(String idNumber);
    List<Skater> findByTeamId(Integer teamId);
}
