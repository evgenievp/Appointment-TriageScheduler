package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.TriageResults;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TriageRepo extends JpaRepository<TriageResults, Long> {
    Optional<TriageResults> findByAppointmentId(Long appointmentId);

}