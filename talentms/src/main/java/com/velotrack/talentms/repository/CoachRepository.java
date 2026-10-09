package com.velotrack.talentms.repository;

import com.velotrack.talentms.model.Coach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CoachRepository extends JpaRepository<Coach, Integer> {
    Optional<Coach> findByEmail(String email);
}
