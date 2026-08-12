package com.TriageScheduller.Triage.dto;


import com.TriageScheduller.Triage.utils.Status;

import java.time.LocalDateTime;

public record AppointmentDto(
        Long slotId,
        Long patientId,
        Long doctorId,
        LocalDateTime appointmentTime,
        Status status,
        String notes
) {
    public AppointmentDto(Long slotId,
                          Long patientId,
                          Long doctorId,
                          LocalDateTime appointmentTime,
                          String notes) {
        this(slotId,
                patientId,
                doctorId,
                appointmentTime, Status.FREE,
                notes);
    }
}
