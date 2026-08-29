package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.repo.DoctorsRepo;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DoctorsService {
    private final DoctorsRepo repo;
    private final PatientsRepo patientsRepo;

    public DoctorsService(DoctorsRepo repo, PatientsRepo patientsRepo) {
        this.repo = repo;
        this.patientsRepo = patientsRepo;
    }

    public DoctorDto findById(Long id) {
       Optional<Doctor> doctor =  repo.findById(id);

       if(doctor.isEmpty()) {
           throw new EntityNotFoundException("no such doctor");
       }

       return toDto(doctor.get());
    }

    public DoctorDto findByEmail(String email) {
        Optional<Doctor> doctor = repo.findByEmail(email);

        if (doctor.isEmpty()) {
            throw new EntityNotFoundException("No doctor");
        }
        Doctor user = doctor.get();
        return toDto(user);
    }

    public List<DoctorDto> getRandomDoctors() {
        List<DoctorDto> dtos = new ArrayList<>();
        for (var doc : repo.findRandomDoctors()) {
            dtos.add(toDto(doc));
        }
        return dtos;
    }

    public DoctorDto toDto(Doctor doc) {
        return new DoctorDto(doc.getId(),
                doc.getName(),
                doc.getSpeciality(),
                doc.getEmail(),
                doc.getRole());
    }


    public List<DoctorDto> getAll() {
        List<DoctorDto> dtos = new ArrayList<>();
        for (var doctor: this.repo.findAll()) {
            dtos.add(toDto(doctor));
        }
        return dtos;
    }


    public Doctor toDoctor(DoctorDto doctor) {
        return new Doctor(
                doctor.id(),
                doctor.name(),
                doctor.speciality(),
                doctor.role()
        );
    }
}