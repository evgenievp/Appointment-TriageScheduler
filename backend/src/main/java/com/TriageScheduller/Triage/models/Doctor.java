package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.Role;
import jakarta.persistence.*;


@Entity
public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String speciality;
    private Role role = Role.DOCTOR;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    protected Doctor() {
    }

    public Doctor(Long id, String speciality, String name) {
        this.id = id;
        this.speciality = speciality;
        this.name = name;
    }

    public Doctor(String name, String speciality) {
        this.name = name;
        this.speciality = speciality;
    }

    public Doctor(Long id, String name, String speciality, Role role) {
        this.id = id;
        this.name = name;
        this.speciality = speciality;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpeciality() {
        return speciality;
    }

    public void setSpeciality(String speciality) {
        this.speciality = speciality;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
