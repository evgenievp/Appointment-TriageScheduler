package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.Status;
import jakarta.persistence.*;


import java.time.LocalDateTime;

@Entity
@Table(
        name = "slots",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"doctor_id", "starts_at"}
        )
)

public class Slot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
    @Column(name = "starts_at", nullable = false)
    private LocalDateTime startsAt;
    @Column(name = "ends_at", nullable = false)
    private LocalDateTime endsAt;
    @Enumerated(EnumType.STRING)
    private Status status = Status.FREE;
    @Column(name = "patient_id", nullable = true)
    private Long patientId;
    @Version
    private Long version;
    private String patientName;

    public Slot() {}



    public Slot(Long patientId, String patientName,
                Status status,
                LocalDateTime endsAt,
                LocalDateTime startsAt,
                Doctor doctor) {
        this.patientId = patientId;
        this.patientName = patientName;
        this.status = status;
        this.endsAt = endsAt;
        this.startsAt = startsAt;
        this.doctor = doctor;
    }

    public Slot(Doctor doctor, LocalDateTime startsAt, int slotTime) {
        this.doctor = doctor;
        this.startsAt = startsAt;
        this.endsAt = startsAt.plusMinutes(slotTime);
    }


    public Slot(Long id, Doctor doctor, 
                LocalDateTime startsAt, 
                LocalDateTime endsAt, 
                Status status, 
                Long patientId) {
        this.id = id;
        this.doctor = doctor;
        this.startsAt = startsAt;
        this.endsAt = endsAt;
        this.status = status;
        this.patientId = patientId;
    }



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }

    public LocalDateTime getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(LocalDateTime startsAt) {
        this.startsAt = startsAt;
    }

    public LocalDateTime getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(LocalDateTime endsAt) {
        this.endsAt = endsAt;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }


    public Long getVersion() {
        return version;
    }

    public void setVersion(Long version) {
        this.version = version;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }
}
