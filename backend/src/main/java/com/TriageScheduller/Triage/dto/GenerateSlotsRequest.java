package com.TriageScheduller.Triage.dto;



import java.time.LocalDate;
import java.time.LocalTime;



public record GenerateSlotsRequest(
        Long doctorId,
        LocalDate startDate,
        LocalDate endDate,
        LocalTime workStart,
        LocalTime workEnd
) {}