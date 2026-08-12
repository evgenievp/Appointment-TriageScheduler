package com.TriageScheduller.Triage.dto;



public record BookSlotRequest(
        Long slotId,
        Long patientId
) {}