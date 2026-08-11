package com.TriageScheduller.Triage.models;

import com.TriageScheduller.Triage.utils.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "slots",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"doctor_id", "starts_at"}
        )
)

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
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
    private final int slotTime = 30;

    public Slot(Doctor doctor, LocalDateTime startsAt) {
        this.doctor = doctor;
        this.startsAt = startsAt;
        this.endsAt = startsAt.plusMinutes(slotTime);
    }

}
