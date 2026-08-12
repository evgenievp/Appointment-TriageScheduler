package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.ExceptionReason;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "exception_day")
@AllArgsConstructor
@NoArgsConstructor
public class ExceptionDay {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate date;
    private ExceptionReason reason;
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;


    public ExceptionDay(LocalDate date,
                        ExceptionReason reason,
                        Doctor doctor) {
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
