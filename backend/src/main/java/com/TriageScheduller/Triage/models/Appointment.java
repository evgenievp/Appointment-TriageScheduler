package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.AppointmentStatus;
import jakarta.persistence.*;

@Entity
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "slot_id", unique = true, nullable = false)
    private Slot slot;
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private User patient;
    private AppointmentStatus status;
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;


    public Appointment(Long id,
                       Doctor doctor,
                       Slot slot,
                       User patient,
                       AppointmentStatus status) {
        this.id = id;
        this.doctor = doctor;
        this.slot = slot;
        this.patient = patient;
        this.status = status;
    }



    public Appointment(){}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Slot getSlot() {
        return slot;
    }

    public void setSlot(Slot slot) {
        this.slot = slot;
    }

    public User getPatient() {
        return patient;
    }

    public void setPatient(User patient) {
        this.patient = patient;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }
}
