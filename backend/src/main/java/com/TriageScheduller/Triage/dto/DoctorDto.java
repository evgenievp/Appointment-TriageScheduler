package com.TriageScheduller.Triage.dto;


public record DoctorDto(
        Long id,
        String name,
        String speciality,
        String role
) {
    public DoctorDto(Long id, String name, String speciality) {
        this(id, name, speciality, "DOCTOR");
    }
}