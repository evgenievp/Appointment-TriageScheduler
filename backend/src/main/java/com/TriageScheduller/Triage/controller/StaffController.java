package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.AppointmentDto;
import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.dto.UserDto;
import com.TriageScheduller.Triage.service.AppointmentsService;
import com.TriageScheduller.Triage.service.PatientsService;
import com.TriageScheduller.Triage.service.SlotsService;
import com.TriageScheduller.Triage.service.StaffService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


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

    @PutMapping("/slots/{slotId}/assign")
    public ResponseEntity<SlotDto> changePatientByPhone(
            @PathVariable Long slotId,
            @RequestParam String phone) {

        UserDto patient = patientsService.findByPhone(phone);

        return ResponseEntity.ok(slotsService.changePatientOfSlot(slotId, patient.id()));
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
