package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.AppointmentDto;
import com.TriageScheduller.Triage.models.Appointment;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.service.AppointmentsService;
import com.TriageScheduller.Triage.service.PatientsService;
import com.TriageScheduller.Triage.service.SlotsService;
import jakarta.annotation.security.PermitAll;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentsController {

    private final AppointmentsService appointmentsService;
    private final SlotsService slotsService;
    private final PatientsService patientsService;

    public AppointmentsController(AppointmentsService appointmentsService,
                                  SlotsService slotsService,
                                  PatientsService patientsService) {
        this.appointmentsService = appointmentsService;
        this.slotsService = slotsService;
        this.patientsService = patientsService;
    }

    @PostMapping("/book/{slotId}")
    public ResponseEntity<AppointmentDto> bookAppointment(
            Authentication authentication,
            @PathVariable Long slotId) {

        String email = authentication.getName();
        User patient = patientsService.findByEmail(email);

        AppointmentDto appointment = slotsService.bookSlot(slotId, patient);
        return ResponseEntity.status(201).body(appointment);
    }

    @GetMapping("/me")
    public ResponseEntity<List<AppointmentDto>> getMyAppointments(Authentication authentication) {
        String email = authentication.getName();
        User patient = patientsService.findByEmail(email);

        return ResponseEntity.ok(appointmentsService.findByPatientId(patient.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelAppointment(@PathVariable Long id) {
        appointmentsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}