package com.TriageScheduller.Triage.dto;


import com.TriageScheduller.Triage.utils.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class DoctorDto {
    @NotBlank
    private String name;
    private String speciality;
    private Role role = Role.DOCTOR;

    public DoctorDto(String name, String speciality) {
        this.name = name;
        this.speciality = speciality;
    }

    public DoctorDto(String name) {
        this.name = name;
    }
}
