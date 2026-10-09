package com.velotrack.talentms.repository;

import com.velotrack.talentms.model.AccessAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccessAuditLogRepository extends JpaRepository<AccessAuditLog, Integer> {
    List<AccessAuditLog> findByCoachId(Integer coachId);

    List<AccessAuditLog> findByCoachIdOrderByChangedAtDesc(Integer coachId);
}

