package com.TriageScheduller.Triage.dto;

import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.utils.ExceptionReason;

import java.time.LocalDate;

public record ExceptionDayDto(
    Long id,
    LocalDate date,
    ExceptionReason reason,
    Doctor doctor)
{
}
