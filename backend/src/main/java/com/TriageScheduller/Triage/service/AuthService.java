package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.LoginRequest;
import com.TriageScheduller.Triage.dto.LoginResponse;
import com.TriageScheduller.Triage.dto.RegisterRequest;
import com.TriageScheduller.Triage.dto.UserDto;
import com.TriageScheduller.Triage.exception.ConflictException;
import com.TriageScheduller.Triage.exception.UnauthorizedException;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.utils.Role;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final PatientsRepo patientsRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(PatientsRepo patientsRepo, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.patientsRepo = patientsRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

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

        return new UserDto(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getPhone(),
                savedUser.getEmail()
        );
    }

    public LoginResponse login (LoginRequest request){

        User user = patientsRepo.findByEmail(request.email())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(token);
    }

}
