package com.TriageScheduller.Triage.dto;


import com.TriageScheduller.Triage.utils.Priority;

public record TriageResponseDto(
        Integer score,
        Priority priority,
        String answers
) {}