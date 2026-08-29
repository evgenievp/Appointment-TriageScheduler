package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.AppointmentStatus;
import com.TriageScheduller.Triage.utils.Priority;
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
    @JoinColumn(name = "patient_id", nullable = true)
    private User patient;
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
    @Enumerated(EnumType.STRING)
    private Priority priority;
    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
    private TriageResults triageResult;
    private String patientName;
    private String patientPhone;



    public Appointment(Long id,
                       Slot slot,
                       User patient,
                       AppointmentStatus status,
                       Doctor doctor,
                       Priority priority,
                       TriageResults triageResult,
                       String patientName,
                       String patientPhone) {
        this.id = id;
        this.slot = slot;
        this.patient = patient;
        this.status = status;
        this.doctor = doctor;
        this.priority = priority;
        this.triageResult = triageResult;
        this.patientName = patientName;
        this.patientPhone = patientPhone;
    }

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
        this.priority = Priority.NORMAL;

    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
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

    public Doctor getDoctor() {
        return doctor;
    }

    public TriageResults getTriageResult() {
        return triageResult;
    }

    public void setTriageResult(TriageResults triageResult) {
        this.triageResult = triageResult;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientPhone() {
        return patientPhone;
    }

    public void setPatientPhone(String patientPhone) {
        this.patientPhone = patientPhone;
    }
}
