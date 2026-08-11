package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.Priority;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
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



}
