package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.service.PatientsService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class PatientsController {

    private final PatientsService service;

    public PatientsController(PatientsService service) {
        this.service = service;
    }


}
