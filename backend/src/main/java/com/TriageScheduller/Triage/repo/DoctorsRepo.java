package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DoctorsRepo extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);
}