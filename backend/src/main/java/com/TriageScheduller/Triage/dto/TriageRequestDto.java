package com.TriageScheduller.Triage.dto;

import com.TriageScheduller.Triage.utils.PainDuration;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record TriageRequestDto(

        @Min(1)
        @Max(10)
        Integer painLevel,

        @NotNull
        PainDuration painDuration,

        Boolean highTemperature,

        Boolean swelling
) {}