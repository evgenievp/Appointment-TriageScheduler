package com.TriageScheduller.Triage.dto;

import com.TriageScheduller.Triage.utils.Status;
import java.time.LocalDateTime;


public record SlotDto(
        Long id,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Status status,
        Long doctorId,
        Long patientId
) {}

