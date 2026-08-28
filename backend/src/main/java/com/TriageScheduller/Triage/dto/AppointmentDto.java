package com.TriageScheduller.Triage.dto;
import com.TriageScheduller.Triage.utils.AppointmentStatus;
import com.TriageScheduller.Triage.utils.Priority;

import java.time.LocalDateTime;



public record AppointmentDto(
        Long appointmentId,
        Long slotId,
        Long patientId,
        Long doctorId,
        LocalDateTime appointmentTime,
        AppointmentStatus status,
        String notes,
        Priority priority,
        String patientName,
        String patientPhone
) {

    public AppointmentDto(
            Long slotId,
            Long patientId,
            Long doctorId,
            LocalDateTime appointmentTime,
            String notes,
            Priority priority,
            String patientName,
            String patientPhone) {
        this(
                null,
                slotId,
                patientId,
                doctorId,
                appointmentTime,
                AppointmentStatus.CONFIRMED,
                notes,
                priority,
                patientName,
                patientPhone
        );
    }
}