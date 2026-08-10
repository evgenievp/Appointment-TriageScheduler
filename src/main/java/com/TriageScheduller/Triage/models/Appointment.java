package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.AppointmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Appointment {
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne(targetEntity = User.class)
    @JoinColumn(name = "patient_id")
    private Slot slot;
    private AppointmentStatus status;


}
