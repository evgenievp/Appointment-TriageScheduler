package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.TriageRequestDto;
import com.TriageScheduller.Triage.dto.TriageResponseDto;
import com.TriageScheduller.Triage.exception.ForbiddenException;
import com.TriageScheduller.Triage.exception.NotFoundException;
import com.TriageScheduller.Triage.models.Appointment;
import com.TriageScheduller.Triage.models.TriageResults;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.repo.AppointmentsRepo;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.repo.TriageRepo;
import org.springframework.transaction.annotation.Isolation;
import com.TriageScheduller.Triage.utils.Priority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;


import java.util.Optional;

@Service
public class TriageService {
    private final TriageRepo triageRepo;
    private final AppointmentsRepo appointmentsRepo;
    private final PatientsRepo patientsRepo;
    private final ObjectMapper objectMapper;

    public TriageService(TriageRepo triageRepo,
                         AppointmentsRepo appointmentsRepo,
                         PatientsRepo patientsRepo, ObjectMapper objectMapper) {
        this.triageRepo = triageRepo;
        this.appointmentsRepo = appointmentsRepo;
        this.patientsRepo = patientsRepo;
        this.objectMapper = objectMapper;
    }


    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TriageResponseDto submitTriage(Long appointmentId,
                                          TriageRequestDto request,
                                          String userEmail) {

        User patient = patientsRepo.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("Patient not found"));

        Appointment appointment = appointmentsRepo.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        if (!appointment.getPatient().getId().equals(patient.getId())) {
            throw new ForbiddenException(
                    "You are not authorized to submit triage for this appointment"
            );
        }

        TriageResults triage = new TriageResults();
        triage.setAppointment(appointment);

        int score = calculateScore(request);
        Priority priority = calculatePriority(score);
        String answers = objectMapper.writeValueAsString(request);

        triage.setAnswers(answers);
        triage.setScore(score);
        triage.setPriority(priority);

        TriageResults saved = triageRepo.save(triage);

        return new TriageResponseDto(
                saved.getScore(),
                saved.getPriority(),
                saved.getAnswers()
        );
    }

    public TriageResponseDto findByAppointmentId(Long appointmentId) {
        Optional<TriageResults> triage = triageRepo.findByAppointmentId(appointmentId);
        if (triage.isEmpty()) {
            throw new NotFoundException("No triage result for this appointment");
        }
        return toDto(triage.get());
    }

    private TriageResponseDto toDto(TriageResults triageResults) {
        return new TriageResponseDto(
                triageResults.getScore(),
                triageResults.getPriority(),
                triageResults.getAnswers());
    }

    private int calculateScore(TriageRequestDto request) {
        int score = 0;

        if (request.painLevel() >= 9) {
            score += 3;
        } else if (request.painLevel() >= 7) {
            score += 2;
        } else if (request.painLevel() >= 4) {
            score += 1;
        }

        switch (request.painDuration()) {
            case LESS_THAN_DAY, ONE_DAY -> score += 0;
            case THREE_DAYS -> score += 1;
            case ONE_WEEK -> score += 2;
            case MORE_THAN_WEEK -> score += 3;
        }

        if (request.highTemperature()) {
            score += 2;
        }

        if (request.swelling()) {
            score += 2;
        }

        return score;
    }

    private Priority calculatePriority(int score) {
        return score >= 5
                ? Priority.URGENT
                : Priority.NORMAL;
    }
}

