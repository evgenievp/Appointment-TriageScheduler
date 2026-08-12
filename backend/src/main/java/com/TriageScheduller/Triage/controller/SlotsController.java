package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.GenerateSlotsRequest;
import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.service.DoctorsService;
import com.TriageScheduller.Triage.service.SlotsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
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
        Doctor doctor = doctorsService.findById(request.doctorId());


        return slotsService.generateSlots(
                doctor,
                request.startDate(),
                request.endDate(),
                request.workStart(),
                request.workEnd()
        );
    }
}