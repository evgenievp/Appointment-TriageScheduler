package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.repo.StaffRepo;
import org.springframework.stereotype.Service;

@Service
public class StaffService {

    private final StaffRepo repo;
    private final PatientsRepo patientsRepo;
    private final AuthService authService;


    public StaffService(StaffRepo repo,
                        PatientsRepo patientsRepo,
                        AuthService authService) {
        this.repo = repo;
        this.patientsRepo = patientsRepo;
        this.authService = authService;
    }


    public void sendNewPasswordLink(String email) {
        authService.generateResetLink(email);

    }
}
