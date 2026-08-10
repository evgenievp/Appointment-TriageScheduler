package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.service.DoctorsService;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DoctorsController {
    private final DoctorsService service;

    public DoctorsController(DoctorsService service) {
        this.service = service;
    }
}
