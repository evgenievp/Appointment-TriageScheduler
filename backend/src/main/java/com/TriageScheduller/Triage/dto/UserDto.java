package com.TriageScheduller.Triage.dto;


public record UserDto(
        Long id,
        String name,
        String phone,
        String email
) {
    public UserDto(Long id, String name, String phone, String email) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
    }

    public UserDto(String name, String phone, String email) {
        this(0L, name, phone, email);
    }
}