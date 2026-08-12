package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.TriageRequestDto;
import com.TriageScheduller.Triage.dto.TriageResponseDto;
import com.TriageScheduller.Triage.models.Appointment;
import com.TriageScheduller.Triage.models.TriageResults;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.repo.AppointmentsRepo;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.repo.TriageRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TriageService {
    private final TriageRepo triageRepo;
    private final AppointmentsRepo appointmentsRepo;
    private final PatientsRepo patientsRepo;

    public TriageService(TriageRepo triageRepo,
                         AppointmentsRepo appointmentsRepo,
                         PatientsRepo patientsRepo) {
        this.triageRepo = triageRepo;
        this.appointmentsRepo = appointmentsRepo;
        this.patientsRepo = patientsRepo;
    }


    public TriageResponseDto submitTriage(Long appointmentId,
                                          TriageRequestDto request,
                                          String userEmail) {
        User patient = patientsRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Appointment appointment = appointmentsRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));


        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new RuntimeException("You are not authorized to submit triage for this appointment");
        }

        TriageResults triage = new TriageResults();
        triage.setAppointment(appointment);
        triage.setAnswers(request.answers());
        triage.setScore(request.score());
        triage.setPriority(request.priority());

        TriageResults saved = triageRepo.save(triage);

        return new TriageResponseDto(
                saved.getScore(),
                saved.getPriority(),
                saved.getAnswers()
        );
    }

    public TriageResponseDto save(TriageResponseDto triageResult) {
        triageRepo.save(toTriage(triageResult));
        return triageResult;
    }

    public TriageResponseDto findByAppointmentId(Long appointmentId) {
        Optional<TriageResults> triage = triageRepo.findByAppointmentId(appointmentId);
        if (triage.isEmpty()) {
            throw new EntityNotFoundException("No such appointment");
        }
        return toDto(triage.get());
    }

    private TriageResponseDto toDto(TriageResults triageResults) {
        return new TriageResponseDto(
                triageResults.getScore(),
                triageResults.getPriority(),
                triageResults.getAnswers());
    }

    private TriageResults toTriage(TriageResponseDto dto) {

        return new TriageResults(
                dto.answers(),
                dto.score(),
                dto.priority()
        );
    }
}

