package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.repo.DoctorsRepo;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import org.springframework.stereotype.Service;

@Service
public class PatientsService {
    private final PatientsRepo repo;
    private final DoctorsRepo doctorsRepo;

    public PatientsService(PatientsRepo repo, DoctorsRepo doctorsRepo) {
        this.repo = repo;
        this.doctorsRepo = doctorsRepo;
    }

    public User findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public User findByEmail(String email) {
        return repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public User save(User patient) {
        return repo.save(patient);
    }
}