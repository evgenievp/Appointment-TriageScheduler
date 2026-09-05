package com.TriageScheduller.Triage.dto;

public record ResetPasswordRequest(String email,
                                   String token,
                                   String newPassword) {

}
