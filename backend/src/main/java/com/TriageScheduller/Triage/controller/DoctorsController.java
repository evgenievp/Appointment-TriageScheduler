package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.AppointmentDto;
import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.dto.ExceptionDayDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.service.AppointmentsService;
import com.TriageScheduller.Triage.service.DoctorsService;
import com.TriageScheduller.Triage.service.ExceptionDayService;
import com.TriageScheduller.Triage.service.SlotsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorsController {

    private final DoctorsService doctorsService;
    private final ExceptionDayService exceptionDayService;
    private final AppointmentsService appointmentsService;
    private final SlotsService slotsService;

    public DoctorsController(DoctorsService doctorsService,
                             ExceptionDayService exceptionDayService,
                             AppointmentsService appointmentsService,
                             SlotsService slotsService) {
        this.doctorsService = doctorsService;
        this.exceptionDayService = exceptionDayService;
        this.appointmentsService = appointmentsService;
        this.slotsService = slotsService;
    }

    @GetMapping("/allDoctors")
    public ResponseEntity<List<DoctorDto>> getAll() {
        return ResponseEntity.status(200).body(this.doctorsService.getAll());
    }


    @GetMapping("/me")
    public ResponseEntity<DoctorDto> getCurrentDoctor(Authentication authentication) {
        String email = authentication.getName();
        DoctorDto doctor = doctorsService.findByEmail(email);
        return ResponseEntity.ok(doctor);
    }

    @GetMapping("/me/exceptions")
    public ResponseEntity<List<ExceptionDayDto>> getMyExceptions(
            Authentication authentication) {

        String email = authentication.getName();
        DoctorDto doctor = doctorsService.findByEmail(email);
        System.out.println("pass finding doctor by email!!!!!!!!!!!!!");

        return ResponseEntity.ok(exceptionDayService.getExceptionDays(doctor.id()));

    }

    @GetMapping("/me/doctor")
    public ResponseEntity<List<AppointmentDto>> getMyDoctorAppointments(Authentication authentication) {
        String email = authentication.getName();
        DoctorDto doctor = doctorsService.findByEmail(email);
        return ResponseEntity.ok(appointmentsService.findByDoctorId(doctor.id()));
    }

    @PostMapping("/me/exceptions")
    public ResponseEntity<ExceptionDayDto> addException(
            Authentication authentication,
            @RequestBody ExceptionDayDto dto) {

        String email = authentication.getName();

        DoctorDto doctor = doctorsService.findByEmail(email);

        slotsService.blockSlotsForDay(dto, doctor);
        ExceptionDayDto saved =
                exceptionDayService.addExceptionDay(doctor.id(), dto);

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