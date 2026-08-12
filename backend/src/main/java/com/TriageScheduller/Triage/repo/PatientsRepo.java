package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientsRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}