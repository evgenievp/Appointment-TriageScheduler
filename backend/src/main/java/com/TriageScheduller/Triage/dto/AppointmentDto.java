package com.TriageScheduller.Triage.dto;


import com.TriageScheduller.Triage.utils.AppointmentStatus;
import com.TriageScheduller.Triage.utils.Status;

import java.time.LocalDateTime;


public record AppointmentDto(
        Long slotId,
        Long patientId,
        Long doctorId,
        LocalDateTime appointmentTime,
        AppointmentStatus status,   // ← промени на AppointmentStatus
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
                appointmentTime,
                AppointmentStatus.CONFIRMED,  // ← сложи CONFIRMED
                notes);
    }
}