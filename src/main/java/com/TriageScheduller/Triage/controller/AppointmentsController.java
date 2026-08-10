package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.service.AppointmentsService;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AppointmentsController {
    private final AppointmentsService service;

    public AppointmentsController(AppointmentsService service) {
        this.service = service;
    }



}
