package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.RegisterRequest;
import com.TriageScheduller.Triage.dto.ResetPasswordRequest;
import com.TriageScheduller.Triage.models.Appointment;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.Slot;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.repo.SlotsRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class EmailService {

    private final String clinicName = "Топ клиник";
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

    @Async
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
        String resetLink = "https://localhost:5173/reset-password?token=" + patient.getResetToken()
                + "&email=" + patient.getEmail();
        message.setSubject("Забравена парола");
        message.setText("Кликнете тук, за да смените Вашата парола: \n" + resetLink);
        mailSender.send(message);
    }

    @Async
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

    @Async
    @Transactional
    public void sendBookHourMail(Long slotId, User patient) {
        Slot slot = slotsRepo.findById(slotId)
                .orElseThrow(() -> new EntityNotFoundException("No such slot"));

        Doctor doctor = slot.getDoctor();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String date = slot.getStartsAt().format(dateFormatter);
        String time = slot.getStartsAt().format(timeFormatter);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(patient.getEmail());
        message.setSubject("Записан час за " + clinicName);
        message.setText(
                "Здравейте!\n" +
                        "Имате запазен час при д-р " + doctor.getName() + "\n" +
                        "Дата: " + date + "\n" +
                        "Час: " + time + "\n\n" +
                        "Екипът на " + clinicName + " Ви пожелава приятен ден!"
        );
        mailSender.send(message);
    }

    @Async
    @Transactional
    public void sendSuccessfulRegisterMail(RegisterRequest request) {
        User user = patientsRepo.findByEmail(request.email())
                .orElseThrow(() -> new EntityNotFoundException("Something went wrong"));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());

        message.setSubject("Успешна регистрация");
        message.setText("Здравейте! \nВие се регистрирахте успешно в " + clinicName +
                " можете да влезете с вашето потребителско име и парола.");
        mailSender.send(message);
    }

    @Async
    @Transactional
    public void passwordChangeEmail(String email) {
        User user = patientsRepo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Something went wrong"));

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());

        message.setSubject("Смяна на парола");
        message.setText("Здравейте! \nНякой промени паролата на Вашия имейл, в случай, че това не сте Вие " +
        "\n моля свържете се незабавно с екипът на " + clinicName +".");
        mailSender.send(message);

    }

    @Async
    public void sendMailForChangeHour(String userEmail, Slot newSlot, Slot oldSlot) {
        SimpleMailMessage message = new SimpleMailMessage();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String date = oldSlot.getStartsAt().format(dateFormatter);
        String time = oldSlot.getStartsAt().format(timeFormatter);

        String newDate = newSlot.getStartsAt().format(dateFormatter);
        String newTime = newSlot.getStartsAt().format(timeFormatter);

        message.setTo(userEmail);

        message.setSubject("Промяна на час за посещение");
        message.setText("Здравейте, Вие успешно променихте час за посещение при д-р " +
                newSlot.getDoctor().getName() + " с дата " + date + " " + time+
                ". Новият час е на: " + newDate + " " + newTime+
                " \nХубав ден!");
        mailSender.send(message);
    }


    @Async
    public void sentCancelMail(Slot slot, String userEmail) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(userEmail);

        message.setSubject("Отказан час за посещение");
        message.setText("Здравейте! Получихме Вашия откза от час за посещение при д-р " +
        slot.getDoctor().getName()+
                " \nЕкипът на "+ clinicName + " Ви желае хубав ден!");
        mailSender.send(message);
    }

    @Async
    @Transactional
    public void sendMailAfterStaffBookHour(Slot slot,
                                           Appointment appointment,
                                           Long newPatientId) {

        User newUser = patientsRepo.findById(newPatientId)
                .orElseThrow(() -> new EntityNotFoundException("No such user"));

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String date = slot.getStartsAt().format(dateFormatter);
        String time = slot.getStartsAt().format(timeFormatter);


        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(newUser.getEmail());


        message.setSubject("Запазен час за посещение");
        message.setText("Здравейте! \n Вие успешно запазихте час при д-р " +
                slot.getDoctor().getName() +
                " на " + date + " " + time +
                "\nекипът на " + clinicName + " Ви желае хубав ден!");
        mailSender.send(message);
    }


}
