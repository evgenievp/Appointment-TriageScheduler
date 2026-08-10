package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.Priority;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Appointment appointment;
    private int score;
    private Priority priority;



}
