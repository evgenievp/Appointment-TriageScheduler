package com.TriageScheduller.Triage.dto;

public record AssignSlotRequest(Long patientId, String phone, String name) {
    public AssignSlotRequest(Long patientId, String phone, String name) {
        this.patientId = patientId;
        this.phone = phone;
        this.name = name;
    }

}
