package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.repo.TriageRepo;
import org.springframework.stereotype.Service;

@Service
public class TriageService {
    private final TriageRepo repo;

    public TriageService(TriageRepo repo) {
        this.repo = repo;
    }
}
