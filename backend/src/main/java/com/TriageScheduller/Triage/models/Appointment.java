package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.AppointmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
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


    public Long getId() {
        return id;
    }

    public Slot getSlot() {
        return slot;
    }

    public User getPatient() {
        return patient;
    }

    public AppointmentStatus getStatus() {
        return status;
    }
}
