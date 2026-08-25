package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.TriageRequestDto;
import com.TriageScheduller.Triage.dto.TriageResponseDto;
import com.TriageScheduller.Triage.service.AppointmentsService;
import com.TriageScheduller.Triage.service.PatientsService;
import com.TriageScheduller.Triage.service.TriageService;
import jakarta.validation.Valid;
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
            @Valid @RequestBody TriageRequestDto request) {

        String email = authentication.getName();

        TriageResponseDto result =
                triageService.submitTriage(appointmentId, request, email);

        return ResponseEntity.status(201).body(result);
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<TriageResponseDto> getTriageResult(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(triageService.findByAppointmentId(appointmentId));
    }
}