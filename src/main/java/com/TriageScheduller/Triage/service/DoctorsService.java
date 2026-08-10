package com.TriageScheduller.Triage.service;


import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.repo.DoctorsRepo;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class DoctorsService {
    private final DoctorsRepo repo;

    public DoctorsService(DoctorsRepo repo) {
        this.repo = repo;
    }

    public Optional<Doctor> findById(Long id) {
        return repo.findById(id);
    }
}
