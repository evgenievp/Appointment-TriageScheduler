package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.GenerateSlotsRequest;
import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.Slot;
import com.TriageScheduller.Triage.service.DoctorsService;
import com.TriageScheduller.Triage.service.SlotsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SlotsController {
    private final SlotsService service;
    private final DoctorsService doctorService;

    public SlotsController(SlotsService service, DoctorsService doctorService) {
        this.service = service;
        this.doctorService = doctorService;
    }

    @GetMapping("/free")
    public List<SlotDto> findFreeSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        List<Slot> freeSlots = service.findFreeSlots(doctorId, from, to);
        return freeSlots.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @GetMapping("/freeSlots")
    public List<SlotDto> getSlotsForCalendar(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime to) {

        return service.getSlotsForCalendar(doctorId, from, to);
    }

    @PostMapping("/generateSlots")
    public List<SlotDto> generateSlots(@RequestBody GenerateSlotsRequest request) {
        Optional<Doctor> optionalDoctor = doctorService.findById(request.getDoctorId());

        if (optionalDoctor.isEmpty()) {
            throw new RuntimeException("Doctor not found");
        }

        Doctor doctor = optionalDoctor.get();
        return service.generateSlots(doctor, request.getStartDate(), request.getEndDate(),
                request.getWorkStart(), request.getWorkEnd());
    }
    public SlotDto toDto(Slot slot) {
        return new SlotDto(
                slot.getId(),
                slot.getStartsAt(),
                slot.getEndsAt(),
                slot.getStatus(),
                slot.getDoctor().getId()
        );
    }
}
