package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.dto.UserDto;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.service.PatientsService;
import com.TriageScheduller.Triage.service.SlotsService;
import com.TriageScheduller.Triage.service.StaffService;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
public class StaffController {
    private final StaffService service;
    private final PatientsService patientsService;
    private final SlotsService slotsService;

    public StaffController(StaffService service, PatientsService patientsService, SlotsService slotsService) {
        this.service = service;
        this.patientsService = patientsService;
        this.slotsService = slotsService;
    }

    @PutMapping("/slots/{slotId}/assign")
    public ResponseEntity<SlotDto> changePatient(@PathVariable Long slotId, Authentication authentication) {
        User user = this.patientsService.findByEmail(authentication.getName());
        return ResponseEntity.status(201).body(this.slotsService.changePatientOfSlot(slotId, user.getId()));
    }

    @GetMapping("/patient/{phoneNumber}")
    public ResponseEntity<UserDto> findSlotByUserPhone(@PathVariable String phoneNumber) {
        return ResponseEntity.status(201).body(this.patientsService.findSlotByUserPhone(phoneNumber));
    }


}
