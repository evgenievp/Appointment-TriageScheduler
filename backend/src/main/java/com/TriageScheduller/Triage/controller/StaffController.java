package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.AppointmentDto;
import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.dto.UserDto;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.service.AppointmentsService;
import com.TriageScheduller.Triage.service.PatientsService;
import com.TriageScheduller.Triage.service.SlotsService;
import com.TriageScheduller.Triage.service.StaffService;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/staff")
public class StaffController {
    private final StaffService service;
    private final PatientsService patientsService;
    private final SlotsService slotsService;
    private final AppointmentsService appointmentsService;

    public StaffController(StaffService service, PatientsService patientsService, SlotsService slotsService, AppointmentsService appointmentsService) {
        this.service = service;
        this.patientsService = patientsService;
        this.slotsService = slotsService;
        this.appointmentsService = appointmentsService;
    }

    @GetMapping("/api/staff/appointments/{date}")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsForTheDay(@PathVariable LocalDate date) {
        return ResponseEntity.status(200).body(this.appointmentsService.getAppointmentsForTheDay(date));
    }


    @PutMapping("/slots/{slotId}/assign")
    public ResponseEntity<SlotDto> changePatient(
            @PathVariable Long slotId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) String name) {

        try {
            UserDto patient = patientsService.findByPhone(phone);
            appointmentsService.changePatient(patientId, slotId, phone, name);
            return ResponseEntity.ok(slotsService.changePatientOfSlot(slotId, patient.id()));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.ok(slotsService.bookSlotWithoutPatient(slotId, name));
        }

    }

    @PatchMapping("/promoteToStaff")
    public ResponseEntity<UserDto> promoteToStaff(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        return ResponseEntity.status(201).body(this.patientsService.promoteToStaff(email));
    }

    @PutMapping("/promoteToDoctor")
    public ResponseEntity<DoctorDto> promoteToDoctor(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String speciality = body.get("speciality");
        return ResponseEntity.status(201)
                .body(this.patientsService.promoteToDoctor(email, speciality));
    }

    @GetMapping("/patient/{phoneNumber}")
    public ResponseEntity<UserDto> findSlotByUserPhone(@PathVariable String phoneNumber) {
        return ResponseEntity.status(201).body(this.patientsService.findSlotByUserPhone(phoneNumber));
    }

    @GetMapping("/all")
    public ResponseEntity<List<AppointmentDto>> getAllAppointments() {
        return ResponseEntity.ok(appointmentsService.findAll());
    }


}
