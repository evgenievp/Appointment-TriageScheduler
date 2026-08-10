package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.repo.AppointmentsRepo;
import org.springframework.stereotype.Service;

@Service
public class AppointementsService {
    private final AppointmentsRepo repo;

    public AppointementsService(AppointmentsRepo repo) {
        this.repo = repo;
    }

}
