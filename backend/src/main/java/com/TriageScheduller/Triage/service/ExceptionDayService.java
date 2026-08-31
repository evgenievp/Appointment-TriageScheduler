package com.TriageScheduller.Triage.service;


import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.dto.ExceptionDayDto;
import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.ExceptionDay;
import com.TriageScheduller.Triage.models.Slot;
import com.TriageScheduller.Triage.repo.ExceptionDayRepo;
import com.TriageScheduller.Triage.utils.Status;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExceptionDayService {
    private final ExceptionDayRepo repo;
    private final DoctorsService doctorsService;
    private final SlotsService slotsService;


    public ExceptionDayService(ExceptionDayRepo repo, DoctorsService doctorsService, SlotsService slotsService) {
        this.repo = repo;
        this.doctorsService = doctorsService;
        this.slotsService = slotsService;
    }

    public List<ExceptionDayDto> getExceptionDays(Long doctorId) {
        return repo.findByDoctorId(doctorId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    @Transactional
    public ExceptionDayDto addExceptionDay(Long doctorId,
                                           ExceptionDayDto dto) {
        DoctorDto doctor = doctorsService.findById(doctorId);
        ExceptionDay day = new ExceptionDay();
        day.setDate(dto.date());

        slotsService.blockSlotsForDay(dto, doctor);
        day.setReason(dto.reason());
        day.setDoctor(dtoToDoctor(doctor));
        ExceptionDay saved = repo.save(day);
        return toDto(saved);
    }

    public Doctor dtoToDoctor(DoctorDto doctor) {
        return new Doctor(
                doctor.id(),
                doctor.name(),
                doctor.speciality(),
                doctor.email()

        );
    }
    @Transactional
    public void deleteExceptionDay(Long id,
                                   Authentication authentication) {
        ExceptionDay day = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("No such day"));
        DoctorDto doctor = this.doctorsService.findByEmail(authentication.getName());
        List<Slot> slots = slotsService.findSlotsByDate(day.getDate(), doctor.id());

        for (var slot : slots) {
            slot.setStatus(Status.FREE);
        }
        repo.delete(day);
    }

    private ExceptionDayDto toDto(ExceptionDay day) {
        return new ExceptionDayDto(
                day.getId(),
                day.getDate(),
                day.getReason(),
                day.getDoctor());
    }
}