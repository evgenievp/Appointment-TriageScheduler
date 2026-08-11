package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.Role;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String speciality;
    private Role role = Role.DOCTOR;

    public Doctor(Long id, String speciality, String name) {
        this.id = id;
        this.speciality = speciality;
        this.name = name;
    }

    public Doctor(String name, String speciality) {
        this.name = name;
        this.speciality = speciality;
    }
}
