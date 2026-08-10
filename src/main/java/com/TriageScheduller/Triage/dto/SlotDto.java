package com.TriageScheduller.Triage.dto;

import com.TriageScheduller.Triage.utils.Status;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SlotDto {
    private Long id;
    private LocalDateTime startsAt;
    private LocalDateTime endsAt;
    private Status status;
    private Long doctorId;
}