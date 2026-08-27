package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.repo.StaffRepo;
import org.springframework.stereotype.Service;

@Service
public class StaffService {

    private final StaffRepo repo;


    public StaffService(StaffRepo repo) {
        this.repo = repo;
    }

}
