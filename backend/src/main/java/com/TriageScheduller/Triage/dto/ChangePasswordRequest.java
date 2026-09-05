package com.TriageScheduller.Triage.dto;

public record ChangePasswordRequest(String oldPassword,
                                    String password,
                                    String repeatPassword) {
}
