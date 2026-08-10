package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.repo.AppointmentsRepo;
import org.springframework.stereotype.Service;

@Service
public class AppointmentsService {
    private final AppointmentsRepo repo;

    public AppointmentsService(AppointmentsRepo repo) {
        this.repo = repo;
    }

}
