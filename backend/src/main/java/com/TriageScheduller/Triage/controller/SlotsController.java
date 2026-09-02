package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.dto.ExceptionDayDto;
import com.TriageScheduller.Triage.dto.GenerateSlotsRequest;
import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.service.DoctorsService;
import com.TriageScheduller.Triage.service.SlotsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;


@RestController
@RequestMapping("/api/slots")
public class SlotsController {

    private final SlotsService slotsService;
    private final DoctorsService doctorsService;

    public SlotsController(SlotsService slotsService, DoctorsService doctorsService) {
        this.slotsService = slotsService;
        this.doctorsService = doctorsService;
    }

    @PatchMapping("/setSlotTime/{slotTime}")
    public ResponseEntity<String> setSlotTime(
            Authentication authentication,
            @PathVariable int slotTime,
            LocalDate startDate,
            LocalDate endDate,
            LocalTime workStart,
            LocalTime workEnd) {

        this.slotsService.setSlotTime(slotTime, authentication, startDate, endDate, workStart, workEnd);
        return ResponseEntity.status(201).body("Success!");
    }


    @PostMapping("/setRestStart")
    public ResponseEntity setRestStart(LocalTime restStart) {
        this.slotsService.setRestStart(restStart);
        return ResponseEntity.status(201).build();
    }

    @PostMapping("/setRestEnd")
    public ResponseEntity setRestEnd(LocalTime restEnd) {
        this.slotsService.setRestEnd(restEnd);
        return ResponseEntity.status(201).build();
    }

    @GetMapping("/free")
    public List<SlotDto> getFreeSlots(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        return slotsService.findFreeSlots(doctorId, from, to)
                .stream()
                .map(slotsService::toDto)
                .toList();
    }

    @GetMapping("/calendar")
    public List<SlotDto> getSlotsForCalendar(
            @RequestParam Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        return slotsService.getSlotsForCalendar(doctorId, from, to);
    }

    @PostMapping("/generate")
    public List<SlotDto> generateSlots(@RequestBody GenerateSlotsRequest request) {
        DoctorDto doctor = doctorsService.findById(request.doctorId());

        return slotsService.generateSlots(
                doctorsService.toDoctor(doctor),
                request.startDate(),
                request.endDate(),
                request.workStart(),
                request.workEnd(),
                request.slotTime()
        );
    }

    @PostMapping("/preview")
    public List<SlotDto> previewSlots(@RequestBody GenerateSlotsRequest request) {

        Doctor doctor = doctorsService.toDoctor(doctorsService.findById(request.doctorId()));
        return slotsService.previewSlots(doctor,
                request.startDate(),
                request.endDate(),
                request.workStart(),
                request.workEnd(),
                request.slotTime());
    }

}