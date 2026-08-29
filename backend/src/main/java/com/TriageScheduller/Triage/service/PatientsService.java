package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.dto.UserDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.repo.DoctorsRepo;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.utils.Role;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PatientsService {
    private final PatientsRepo repo;
    private final DoctorsRepo doctorsRepo;
    private final DoctorsService doctorsService;

    public PatientsService(PatientsRepo repo, DoctorsRepo doctorsRepo, DoctorsService doctorsService) {
        this.repo = repo;
        this.doctorsRepo = doctorsRepo;
        this.doctorsService = doctorsService;
    }

    public String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }

        String cleaned = phone.replaceAll("[^0-9+]", "");

        if (cleaned.startsWith("0") && cleaned.length() == 10) {
            return "+359" + cleaned.substring(1);
        }

        if (cleaned.startsWith("359") && cleaned.length() == 12) {
            return "+" + cleaned;
        }

        if (cleaned.startsWith("+")) {
            return cleaned;
        }

        return "+" + cleaned;
    }

    public User findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public User findByEmail(String email) {
        return repo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));
    }

    public User save(User patient) {
        patient.setPhone(patient.getPhone());
        return repo.save(patient);
    }


    public UserDto findSlotByUserPhone(String phoneNumber) {
        Optional<User> user = this.repo.findByPhone(phoneNumber);

        if (user.isEmpty()) {
            throw new EntityNotFoundException("No such user");
        }

        return toDto(user.get());
    }


    private UserDto toDto(User user) {
        return  new UserDto(
                user.getId(),
                user.getName(),
                user.getPhone(),
                user.getEmail()
        );
    }

    public UserDto findByPhone(String phone) {
        String normalized = normalizePhone(phone);
        User user = repo.findByPhone(normalized)
                .orElseThrow(() -> new EntityNotFoundException("No such user"));
        return toDto(user);
    }

    public UserDto promoteToStaff(String email) {
        User user = this.repo.findByPhone(email)
                .orElseThrow(() -> new EntityNotFoundException("No such user"));

        user.setRole(Role.STAFF);

        return toDto(user);

    }

    public DoctorDto promoteToDoctor(String email, String speciality) {
        User user = this.repo.findByPhone(email)
                .orElseThrow(() -> new EntityNotFoundException("No such user"));

        Doctor doctor = new Doctor(user.getId(), user.getName(), speciality, Role.DOCTOR, email);
        doctor.setUser(user);
        return this.doctorsService.toDto(doctor);

    }
}