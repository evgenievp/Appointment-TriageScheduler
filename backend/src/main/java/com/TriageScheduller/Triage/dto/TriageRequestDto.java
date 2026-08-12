package com.TriageScheduller.Triage.dto;

import com.TriageScheduller.Triage.utils.Priority;

public record TriageRequestDto(
        String answers,
        int score,
        Priority priority
) {}