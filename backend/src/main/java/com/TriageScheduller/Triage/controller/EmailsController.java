package com.TriageScheduller.Triage.controller;

import com.TriageScheduller.Triage.dto.ResetPasswordRequest;
import com.TriageScheduller.Triage.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/emails")
public class EmailsController {
    private final EmailService emailService;
    public EmailsController(EmailService emailService) {
        this.emailService = emailService;
    }


    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.token() == null || request.newPassword() == null || request.email() == null) {
            return ResponseEntity.badRequest().body("Invalid request");
        }
        String resetToken = UUID.randomUUID().toString();
        String resetLink = "https://medical-clinik.com/reset-password?token=" + request.token() + "&email=" + request.email();
        emailService.sendResetPasswordEmail(request.email());
        return ResponseEntity.ok("Password updated!");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        emailService.sendResetPasswordEmail(email);
        return ResponseEntity.ok().build();
    }



}
