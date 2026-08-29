package com.TriageScheduller.Triage.service;


import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.dto.ExceptionDayDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.ExceptionDay;
import com.TriageScheduller.Triage.repo.ExceptionDayRepo;
import org.springframework.stereotype.Service;

import java.util.List;
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

    public void deleteExceptionDay(Long id) {
        repo.deleteById(id);
    }

    private ExceptionDayDto toDto(ExceptionDay day) {
        return new ExceptionDayDto(
                day.getId(),
                day.getDate(),
                day.getReason(),
                day.getDoctor());
    }
}