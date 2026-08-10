package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.repo.PatientsRepo;
import org.springframework.stereotype.Service;

@Service
public class PatientsService {
    private final PatientsRepo repo;

    public PatientsService(PatientsRepo repo) {
        this.repo = repo;
    }

}

