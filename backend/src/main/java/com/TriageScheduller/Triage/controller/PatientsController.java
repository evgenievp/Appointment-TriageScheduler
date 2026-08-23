package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.UpdatePatientRequest;
import com.TriageScheduller.Triage.dto.UserDto;
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
    public ResponseEntity<UserDto> getCurrentPatient(Authentication authentication) {
        String email = authentication.getName();
        User patient = patientsService.findByEmail(email);

        UserDto dto = new UserDto(
                patient.getId(),
                patient.getName(),
                patient.getPhone(),
                patient.getEmail()
        );

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updatePatient(
            Authentication authentication,
            @RequestBody UpdatePatientRequest request) {

        String email = authentication.getName();
        User patient = patientsService.findByEmail(email);
        patient.setName(request.name());
        patient.setPhone(request.phone());

        User savedPatient = patientsService.save(patient);

        UserDto dto = new UserDto(
                savedPatient.getId(),
                savedPatient.getName(),
                savedPatient.getPhone(),
                savedPatient.getEmail()
        );

        return ResponseEntity.ok(dto);
    }
}