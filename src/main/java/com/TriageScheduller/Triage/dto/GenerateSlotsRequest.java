package com.TriageScheduller.Triage.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;


@Getter
@Setter
public class GenerateSlotsRequest {
    private Long doctorId;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalTime workStart;
    private LocalTime workEnd;


}
