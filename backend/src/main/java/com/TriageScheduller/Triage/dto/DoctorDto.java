package com.TriageScheduller.Triage.dto;


import com.TriageScheduller.Triage.utils.Role;

public record DoctorDto(
        Long id,
        String name,
        String speciality,
        String email,
        String role

) {
    public DoctorDto(Long id,
                     String name,
                     String speciality,
                     String email,
                     Role role) {
        this(id, name, speciality, email, role.name());
    }

}