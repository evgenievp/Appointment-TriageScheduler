package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorsRepo extends JpaRepository<Doctor, Long> {

}
