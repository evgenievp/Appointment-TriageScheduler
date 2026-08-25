package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.repo.DoctorsRepo;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DoctorsService {
    private final DoctorsRepo repo;
    private final PatientsRepo patientsRepo;

    public DoctorsService(DoctorsRepo repo, PatientsRepo patientsRepo) {
        this.repo = repo;
        this.patientsRepo = patientsRepo;
    }

    public Doctor findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public Doctor findByEmail(String email) {

        User user = patientsRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return repo.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public List<DoctorDto> getRandomDoctors() {
        List<DoctorDto> dtos = new ArrayList<>();
        for (var doc : repo.findRandomDoctors()) {
            dtos.add(toDto(doc));
        }
        return dtos;
    }

    private DoctorDto toDto(Doctor doc) {
        return new DoctorDto(doc.getId(), doc.getName(), doc.getSpeciality());
    }


}