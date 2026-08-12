package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.TriageResponseDto;
import com.TriageScheduller.Triage.models.Appointment;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.service.AppointmentsService;
import com.TriageScheduller.Triage.service.PatientsService;
import com.TriageScheduller.Triage.service.TriageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/triage")
public class TriageResultsController {

    private final TriageService triageService;
    private final AppointmentsService appointmentsService;
    private final PatientsService patientsService;

    public TriageResultsController(TriageService triageService,
                            AppointmentsService appointmentsService,
                            PatientsService patientsService) {
        this.triageService = triageService;
        this.appointmentsService = appointmentsService;
        this.patientsService = patientsService;
    }

    @PostMapping("/{appointmentId}")
    public ResponseEntity<TriageResponseDto> submitTriage(
            Authentication authentication,
            @PathVariable Long appointmentId,
            @RequestBody TriageResponseDto triageResult) {

        String email = authentication.getName();
        User patient = patientsService.findByEmail(email);

        Appointment appointment = appointmentsService.findById(appointmentId);

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.status(201).body(triageService.save(triageResult));
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<TriageResponseDto> getTriageResult(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(triageService.findByAppointmentId(appointmentId));
    }
}