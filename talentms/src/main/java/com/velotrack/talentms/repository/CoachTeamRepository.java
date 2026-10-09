package com.velotrack.talentms.repository;

import com.velotrack.talentms.model.CoachTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface CoachTeamRepository extends JpaRepository<CoachTeam, CoachTeam.CoachTeamId> {
    List<CoachTeam> findByCoach(com.velotrack.talentms.model.Coach coach);

    List<CoachTeam> findByCoachId(Integer coachId);

    void deleteByCoach(com.velotrack.talentms.model.Coach coach);

    boolean existsByTeamId(Integer teamId);
}
