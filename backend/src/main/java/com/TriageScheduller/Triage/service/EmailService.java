package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.ResetPasswordRequest;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.Slot;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.repo.SlotsRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final PatientsRepo patientsRepo;
    private final PasswordEncoder passwordEncoder;
    private final SlotsRepo slotsRepo;

    public EmailService(JavaMailSender mailSender,
                        PatientsRepo patientsRepo,
                        PasswordEncoder passwordEncoder,
                        SlotsRepo slotsRepo) {
        this.mailSender = mailSender;
        this.patientsRepo = patientsRepo;
        this.passwordEncoder = passwordEncoder;
        this.slotsRepo = slotsRepo;
    }

    @Transactional
    public void sendResetPasswordEmail(String toEmail) {
        User patient = patientsRepo.findByEmail(toEmail)
                .orElseThrow(() -> new EntityNotFoundException("No such user"));

        String token = UUID.randomUUID().toString();

        patient.setResetToken(token);
        patient.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        patientsRepo.save(patient);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        String resetLink = "https://medical-clinik.com/reset-password?token=" + patient.getResetToken()
                + "&email=" + patient.getEmail();
        message.setSubject("Reset your password");
        message.setText("Click the link to reset your password:\n" + resetLink);
        mailSender.send(message);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = patientsRepo.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getResetToken() == null) {
            throw new RuntimeException("No reset token found");
        }

        if (!user.getResetToken().equals(request.token())) {
            throw new RuntimeException("Invalid token");
        }

        if (user.getResetTokenExpiry() == null ||
                user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        patientsRepo.save(user);
    }

    @Transactional
    public void sendBookHourMail(Long slotId, User patient) {
        Slot slot = slotsRepo.findById(slotId)
                .orElseThrow(() -> new EntityNotFoundException("No such slot"));

        Doctor doctor = slot.getDoctor();
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(patient.getEmail());

        message.setSubject("HourBooked");
        message.setText("You book a hour with dr " +
                doctor.getName() + " at: " + slot.getStartsAt() +
                "have a nice day.");
    }
}
