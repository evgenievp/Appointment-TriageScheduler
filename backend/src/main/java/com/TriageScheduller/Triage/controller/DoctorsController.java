package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.dto.ExceptionDayDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.service.DoctorsService;
import com.TriageScheduller.Triage.service.ExceptionDayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorsController {

    private final DoctorsService doctorsService;
    private final ExceptionDayService exceptionDayService;

    public DoctorsController(DoctorsService doctorsService, ExceptionDayService exceptionDayService) {
        this.doctorsService = doctorsService;
        this.exceptionDayService = exceptionDayService;
    }

    @GetMapping("")
    public ResponseEntity<List<DoctorDto>> getRandomDoctors() {
        return ResponseEntity.status(200).body(this.doctorsService.getRandomDoctors());
    }


    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Doctor> getCurrentDoctor(Authentication authentication) {
        String email = authentication.getName();
        Doctor doctor = doctorsService.findByEmail(email);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/me/exceptions")
    public ResponseEntity<List<ExceptionDayDto>> getMyExceptions(
            Authentication authentication) {

        String email = authentication.getName();
        Doctor doctor = doctorsService.findByEmail(email);

        return ResponseEntity.ok(
                exceptionDayService.getExceptionDays(doctor.getId())
        );
    }

    @PostMapping("/me/exceptions")
    public ResponseEntity<ExceptionDayDto> addException(
            Authentication authentication,
            @RequestBody ExceptionDayDto dto) {

        String email = authentication.getName();

        Doctor doctor = doctorsService.findByEmail(email);

        ExceptionDayDto saved =
                exceptionDayService.addExceptionDay(doctor.getId(), dto);

        return ResponseEntity.status(201).body(saved);
    }

    @DeleteMapping("/me/exceptions/{id}")
    public ResponseEntity<Void> deleteException(
            Authentication authentication,
            @PathVariable Long id) {

        exceptionDayService.deleteExceptionDay(id);
        return ResponseEntity.noContent().build();
    }
}