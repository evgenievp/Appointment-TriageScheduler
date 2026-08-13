package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.models.*;
import com.TriageScheduller.Triage.repo.AppointmentsRepo;
import com.TriageScheduller.Triage.repo.ExceptionDayRepo;
import com.TriageScheduller.Triage.repo.SlotsRepo;
import com.TriageScheduller.Triage.utils.AppointmentStatus;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SlotsService {

    private final SlotsRepo repo;
    private final AppointmentsRepo appointmentsRepo;
    private final ExceptionDayRepo exceptionDayRepo;
    private LocalTime restStart;
    private LocalTime restEnd;

    public SlotsService(SlotsRepo repo,
                        AppointmentsRepo appointmentsRepo,
                        ExceptionDayRepo exceptionDayRepo) {
        this.repo = repo;
        this.appointmentsRepo = appointmentsRepo;
        this.exceptionDayRepo = exceptionDayRepo;
        this.restStart = LocalTime.of(12,0);
        this.restEnd = LocalTime.of(13,0);

    }

    @Transactional
    public List<SlotDto> generateSlots(Doctor doctor,
                                       LocalDate startDate,
                                       LocalDate endDate,
                                       LocalTime workStart,
                                       LocalTime workEnd) {
        Set<LocalDate> exceptionDays = exceptionDayRepo.findByDoctorIdAndDateBetween(
                        doctor.getId(), startDate, endDate)
                .stream()
                .map(ExceptionDay::getDate)
                .collect(Collectors.toSet());


        LocalDate currentDate = startDate;
        List<SlotDto> generatedSlots = new ArrayList<>();

        while (!currentDate.isAfter(endDate)) {

            if (isExceptionDay(currentDate, exceptionDays)) {
                currentDate = currentDate.plusDays(1);
                continue;
            }

            if (!isWorkingDay(currentDate)) {
                currentDate = currentDate.plusDays(1);
                continue;
            }

            List<SlotDto> daySlots = generateSlotsForDay(doctor, currentDate, workStart, workEnd);
            generatedSlots.addAll(daySlots);

            currentDate = currentDate.plusDays(1);
        }

        return generatedSlots;
    }

    private List<SlotDto> generateSlotsForDay(Doctor doctor,
                                              LocalDate date,
                                              LocalTime workStart,
                                              LocalTime workEnd) {

        List<SlotDto> daySlots = new ArrayList<>();
        LocalDateTime current = LocalDateTime.of(date, workStart);
        LocalDateTime endOfWorkDay = LocalDateTime.of(date, workEnd);

        while (current.isBefore(endOfWorkDay)) {
            LocalDateTime slotEnd = current.plusMinutes(30);

            if (isRestTime(current, this.restStart, this.restEnd)) {
                current = slotEnd;
                continue;
            }

            if (slotEnd.isAfter(endOfWorkDay)) {
                break;
            }

            if (!repo.existsByDoctorAndStartsAt(doctor, current)) {
                Slot slot = new Slot(doctor, current);
                daySlots.add(toDto(repo.save(slot)));
            }
            current = slotEnd;
        }
        return daySlots;
    }

    public void setRestStart(LocalTime restStart) {
        this.restStart = restStart;
    }

    public void setRestEnd(LocalTime restEnd) {
        this.restEnd = restEnd;
    }

    private boolean isRestTime(LocalDateTime current,
                               LocalTime restStart,
                               LocalTime restEnd) {
        LocalTime time = current.toLocalTime();
        return !time.isBefore(restStart) && time.isBefore(restEnd);
    }

    private boolean isWorkingDay(LocalDate date) {
        DayOfWeek day = date.getDayOfWeek();
        return day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY;
    }


    private boolean isExceptionDay(LocalDate date, Set<LocalDate> exceptionDays) {
        return exceptionDays.contains(date);
    }


    private void validateSlotIsWorkingDay(Slot slot) {
        boolean isException = exceptionDayRepo.existsByDoctorIdAndDate(slot.getDoctor().getId(),
                slot.getStartsAt().toLocalDate());
        if (isException) {
            throw new EntityNotFoundException("This doctor isn't available");
        }
    }


    public List<Slot> findFreeSlots(Long doctorId, LocalDateTime from, LocalDateTime to) {
        return repo.findFreeSlots(doctorId, from, to);
    }

    @Transactional
    public Appointment bookSlot(Long slotId, User patient) {
        Slot slot = validateAndGetSlot(slotId);
        checkIfSlotIsFree(slot);
        validateSlotIsWorkingDay(slot);
        reserveSlot(slot, patient);
        return createAppointment(slot, patient);
    }

    private Appointment createAppointment(Slot slot, User patient){
        Appointment appointment = new Appointment();
        appointment.setSlot(slot);
        appointment.setPatient(patient);
        appointment.setDoctor(slot.getDoctor());
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        return appointmentsRepo.save(appointment);
    }

    private void reserveSlot(Slot slot,
                             User patient) {
        int updated = repo.bookSlot(slot.getId());
        if (updated == 0) {
            throw new RuntimeException("Can't use that slot");
        }
        slot.setPatientId(patient.getId());
        repo.save(slot);
    }


    private void checkIfSlotIsFree(Slot slot) {
        if (slot.getPatientId() != null) {
            throw new RuntimeException("Slot is not free");
        }
    }

    private Slot validateAndGetSlot(Long slotId) {
        return repo.findById(slotId).orElseThrow(() -> new EntityNotFoundException("Slot not found"));
    }


    @Transactional
    public void freeSlot(Long slotId) {
        int updated = repo.freeSlot(slotId);
        if (updated == 0) {
            throw new RuntimeException("Slot is not booked or not found");
        }

        Slot slot = repo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
        slot.setPatientId(null);
        repo.save(slot);
    }

    public List<SlotDto> getSlotsForCalendar(Long doctorId,
                                             LocalDateTime from,
                                             LocalDateTime to) {
        List<Slot> slots = repo.findByDoctorIdAndStartsAtBetween(doctorId, from, to);

        return slots.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SlotDto toDto(Slot slot) {
        Long patientId = slot.getPatientId() != null ? slot.getPatientId() : null;

        return new SlotDto(
                slot.getId(),
                slot.getStartsAt(),
                slot.getEndsAt(),
                slot.getStatus(),
                slot.getDoctor().getId(),
                patientId
        );
    }
}