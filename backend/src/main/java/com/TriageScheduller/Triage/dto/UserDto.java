package com.TriageScheduller.Triage.dto;


public record UserDto(
        Long id,
        String name,
        String phone,
        String email
) {}