package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.service.TriageService;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TriageResultsController {
    private final TriageService service;

    public TriageResultsController(TriageService service) {
        this.service = service;
    }

}
