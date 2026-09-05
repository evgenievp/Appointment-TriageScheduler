package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.*;
import com.TriageScheduller.Triage.exception.ConflictException;
import com.TriageScheduller.Triage.exception.UnauthorizedException;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.utils.Role;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final PatientsRepo patientsRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    public AuthService(PatientsRepo patientsRepo, PasswordEncoder passwordEncoder, JwtService jwtService, EmailService emailService) {
        this.patientsRepo = patientsRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;

        this.emailService = emailService;
    }

    @Transactional
    public UserDto register(RegisterRequest request){

        if (patientsRepo.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered!");
        }

        String hashedPassword = passwordEncoder.encode(request.password());

        User user = new User(
                request.email(),
                hashedPassword,
                request.name(),
                request.phone()
        );

        user.setRole(Role.PATIENT);

        User savedUser = patientsRepo.save(user);
        emailService.sendSuccessfulRegisterMail(request);
        return new UserDto(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getPhone(),
                savedUser.getEmail()
        );
    }
    @Transactional
    public LoginResponse login (LoginRequest request){

        User user = patientsRepo.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(token);
    }

    @Transactional
    public String changePassword(ChangePasswordRequest request) {
        User user = patientsRepo.findByEmail(request.email())
                .orElseThrow(() -> new EntityNotFoundException("No such user"));
        if (!request.password().equals(request.repeatPassword())) {
            throw new ConflictException("Password didn't match");
        }
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new ConflictException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.password()));
        patientsRepo.save(user);
        return "Password changed";

    }


}
