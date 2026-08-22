package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.RegisterRequest;
import com.TriageScheduller.Triage.dto.UserDto;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final PatientsRepo patientsRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthService(PatientsRepo patientsRepo, PasswordEncoder passwordEncoder) {
        this.patientsRepo = patientsRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto register(RegisterRequest request){

        if(patientsRepo.existsByEmail(request.email())){
            throw  new IllegalStateException("Email already Registered!");
        }

        String hashedPassword = passwordEncoder.encode(request.password());

        User user = new User(
                request.email(),
                hashedPassword,
                request.name(),
                request.phone()
        );

        User savedUser = patientsRepo.save(user);

        return new UserDto(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getPhone(),
                savedUser.getEmail()
        );
    }

}
