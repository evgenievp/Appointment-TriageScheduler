package com.TriageScheduller.Triage.dto;

public record RegisterRequest (
    String email,
    String password,
    String name,
    String phone
){}
