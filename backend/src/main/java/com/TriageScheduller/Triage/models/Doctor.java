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
    private String email;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    protected Doctor() {
    }

    public Doctor(Long id, String name,
                  String speciality,
                  String email,
                  Role role,
                  User user) {
        this.id = id;
        this.name = name;
        this.speciality = speciality;
        this.email = email;
        this.role = role;
        this.user = user;
    }

    public Doctor(Long id, String name,
                  String speciality,
                  String email) {
        this.id = id;
        this.name = name;
        this.speciality = speciality;
        this.email = email;
    }

    public Doctor(Long id, String name, String speciality, Role role, String email) {
        this.id = id;
        this.name = name;
        this.speciality = speciality;
        this.role = role;
        this.email = email;
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


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
