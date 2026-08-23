package com.TriageScheduller.Triage.dto;

public record UpdatePatientRequest(
        String name,
        String phone
) {
}
