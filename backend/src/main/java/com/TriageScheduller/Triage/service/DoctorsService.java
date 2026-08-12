package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.repo.DoctorsRepo;
import org.springframework.stereotype.Service;

@Service
public class DoctorsService {
    private final DoctorsRepo repo;

    public DoctorsService(DoctorsRepo repo) {
        this.repo = repo;
    }

    public Doctor findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }


}