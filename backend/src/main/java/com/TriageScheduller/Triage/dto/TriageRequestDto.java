package com.TriageScheduller.Triage.dto;

import com.TriageScheduller.Triage.utils.PainDuration;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record TriageRequestDto(

        @Min(1)
        @Max(10)
        int painLevel,

        @NotNull
        PainDuration painDuration,

        boolean highTemperature,

        boolean swelling
) {}