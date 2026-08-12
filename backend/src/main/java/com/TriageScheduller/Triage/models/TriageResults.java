package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.Priority;
import jakarta.persistence.*;


@Entity
public class TriageResults {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "appointment_id", unique = true, nullable = false)
    private Appointment appointment;
    @Column(columnDefinition = "jsonb")
    private String answers;
    private int score;
    @Enumerated(EnumType.STRING)
    private Priority priority;

    public TriageResults(Long id,
                         Appointment appointment,
                         String answers,
                         int score,
                         Priority priority) {
        this.id = id;
        this.appointment = appointment;
        this.answers = answers;
        this.score = score;
        this.priority = priority;
    }

    public TriageResults() {}

    public TriageResults(String answers, int score, Priority priority) {
        this.answers = answers;
        this.score = score;
        this.priority = priority;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public String getAnswers() {
        return answers;
    }

    public void setAnswers(String answers) {
        this.answers = answers;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }
}
