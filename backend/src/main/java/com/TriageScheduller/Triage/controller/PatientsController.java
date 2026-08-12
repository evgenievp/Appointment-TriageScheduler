package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.service.PatientsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
public class PatientsController {

    private final PatientsService patientsService;

    public PatientsController(PatientsService patientsService) {
        this.patientsService = patientsService;
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentPatient(Authentication authentication) {
        String email = authentication.getName();
        User patient = patientsService.findByEmail(email);
        return ResponseEntity.ok(patient);
    }

    @PutMapping("/me")
    public ResponseEntity<User> updatePatient(
            Authentication authentication,
            @RequestBody User updatedPatient) {

        String email = authentication.getName();
        User patient = patientsService.findByEmail(email);

        patient.setName(updatedPatient.getName());
        patient.setPhone(updatedPatient.getPhone());

        return ResponseEntity.ok(patientsService.save(patient));
    }
}