package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.TriageResults;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TriageRepo extends JpaRepository<TriageResults, Long> {

}
