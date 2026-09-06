package com.TriageScheduller.Triage.service;


import org.springframework.stereotype.Service;

@Service
public class StaffService {


    private final AuthService authService;
    private final EmailService emailService;


    public StaffService(AuthService authService,
                        EmailService emailService) {
        this.authService = authService;
        this.emailService = emailService;
    }


    public void sendNewPasswordLink(String email) {
        emailService.sendResetPasswordEmail(email);
    }
}
