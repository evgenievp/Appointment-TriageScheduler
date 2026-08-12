package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.ExceptionReason;
import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "exception_days")
public class ExceptionDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExceptionReason reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    public ExceptionDay() {}

    public ExceptionDay(LocalDate date, ExceptionReason reason, Doctor doctor) {
        this.date = date;
        this.reason = reason;
        this.doctor = doctor;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public ExceptionReason getReason() {
        return reason;
    }

    public void setReason(ExceptionReason reason) {
        this.reason = reason;
    }

    public Doctor getDoctor() {
        return doctor;
    }

    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }
}