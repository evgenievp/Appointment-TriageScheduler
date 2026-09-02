package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.AppointmentDto;
import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.dto.ExceptionDayDto;
import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.exception.ConflictException;
import com.TriageScheduller.Triage.exception.NotFoundException;
import com.TriageScheduller.Triage.models.*;
import com.TriageScheduller.Triage.repo.AppointmentsRepo;
import com.TriageScheduller.Triage.repo.ExceptionDayRepo;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.repo.SlotsRepo;
import com.TriageScheduller.Triage.utils.AppointmentStatus;
import com.TriageScheduller.Triage.utils.Status;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SlotsService {

    private final SlotsRepo repo;
    private final AppointmentsRepo appointmentsRepo;
    private final ExceptionDayRepo exceptionDayRepo;
    private final PatientsRepo patientsRepo;
    private final DoctorsService doctorsService;
    private LocalTime restStart;
    private LocalTime restEnd;
    private int slotTime;

    public SlotsService(SlotsRepo repo,
                        AppointmentsRepo appointmentsRepo,
                        ExceptionDayRepo exceptionDayRepo, PatientsRepo patientsRepo, DoctorsService doctorsService) {
        this.repo = repo;
        this.appointmentsRepo = appointmentsRepo;
        this.exceptionDayRepo = exceptionDayRepo;
        this.patientsRepo = patientsRepo;
        this.doctorsService = doctorsService;
        this.restStart = LocalTime.of(12,0);
        this.restEnd = LocalTime.of(13,0);


    }

    public void setSlotTime(int slotTime,
                            Authentication authentication,
                            LocalDate startDate,
                            LocalDate endDate,
                            LocalTime workStart,
                            LocalTime workEnd) {
        if (slotTime <= 0 || startDate.isBefore(LocalDate.now()) || endDate.isBefore(LocalDate.now())) {
            return;
        }
        String email = authentication.getName();
        DoctorDto doctor = doctorsService.findByEmail(email);
        repo.deleteSlotsByDoctorAndDateRange(doctor.id(),
                startDate.atTime(8,0),
                endDate.atTime(20,0));
        generateSlots(doctorsService.toDoctor(doctor),
                startDate,
                endDate,
                workStart,
                workEnd,
                slotTime);
    }


    @Transactional
    public List<SlotDto> generateSlots(Doctor doctor,
                                       LocalDate startDate,
                                       LocalDate endDate,
                                       LocalTime workStart,
                                       LocalTime workEnd,
                                       int slotTime) {
        Set<LocalDate> exceptionDays = exceptionDayRepo.findByDoctorIdAndDateBetween(
                        doctor.getId(), startDate, endDate)
                .stream()
                .map(ExceptionDay::getDate)
                .collect(Collectors.toSet());

        this.slotTime = slotTime;
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

            List<SlotDto> daySlots = generateSlotsForDay(doctor, currentDate, workStart, workEnd, slotTime);
            generatedSlots.addAll(daySlots);

            currentDate = currentDate.plusDays(1);
        }

        return generatedSlots;
    }

    private List<SlotDto> generateSlotsForDay(Doctor doctor,
                                              LocalDate date,
                                              LocalTime workStart,
                                              LocalTime workEnd,
                                              int slotTime) {
        this.slotTime = slotTime;

        List<SlotDto> daySlots = new ArrayList<>();
        LocalDateTime current = LocalDateTime.of(date, workStart);
        LocalDateTime endOfWorkDay = LocalDateTime.of(date, workEnd);

        while (current.isBefore(endOfWorkDay)) {
            LocalDateTime slotEnd = current.plusMinutes(this.slotTime);

            if (isRestTime(current, this.restStart, this.restEnd)) {
                current = slotEnd;
                continue;
            }

            if (slotEnd.isAfter(endOfWorkDay)) {
                break;
            }

            if (!repo.existsByDoctorAndStartsAt(doctor, current)) {
                Slot slot = new Slot(doctor, current, slotTime);
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

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public AppointmentDto bookSlot(Long slotId, User patient, String patientName, String patientPhone) {
        Slot slot = validateAndGetSlot(slotId);
        checkIfSlotIsFree(slot);
        validateSlotIsWorkingDay(slot);

        int updated = repo.bookSlot(slot.getId(), patient != null ? patient.getId() : null);
        if (updated == 0) {
            throw new ConflictException("Slot already booked");
        }

        if (patient != null) {
            slot.setPatientId(patient.getId());
        } else {
            slot.setPatientId(null);
        }
        slot.setStatus(Status.BOOKED);
        repo.save(slot);

        Appointment appointment = new Appointment();
        appointment.setSlot(slot);
        appointment.setDoctor(slot.getDoctor());
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        if (patient != null) {
            appointment.setPatient(patient);
            appointment.setPatientName(patient.getName());
            appointment.setPatientPhone(patient.getPhone());
        } else {
            appointment.setPatient(null);
            appointment.setPatientName(patientName);
            appointment.setPatientPhone(patientPhone);
        }

        Appointment saved = appointmentsRepo.save(appointment);
        return toDto(saved);
    }

    private Appointment createAppointment(Slot slot, User patient){
        Appointment appointment = new Appointment();
        appointment.setSlot(slot);
        appointment.setPatient(patient);
        appointment.setDoctor(slot.getDoctor());
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setPatientName(patient.getName());
        appointment.setPatientPhone(patient.getPhone());
        return appointmentsRepo.save(appointment);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public void reserveSlot(Slot slot, User patient) {
        int updated = repo.bookSlot(slot.getId(), patient.getId());
        if (updated == 0) {
            throw new ConflictException("Slot already booked");
        }

    }

    private void checkIfSlotIsFree(Slot slot) {
        if (slot.getPatientId() != null) {
            throw new ConflictException("Slot is not free");
        }
    }

    private Slot validateAndGetSlot(Long slotId) {
        return repo.findById(slotId).orElseThrow(() -> new EntityNotFoundException("Slot not found"));
    }


    @Transactional
    public void freeSlot(Long slotId) {
        Slot slot = repo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (slot.getStatus() == Status.FREE) {
            return;
        }

        int updated = repo.freeSlot(slotId);
        if (updated == 0) {
            throw new NotFoundException("Slot is not booked or not found");
        }

        slot.setStatus(Status.FREE);
        slot.setPatientId(null);
        repo.save(slot);
    }

    @Transactional
    public void makeSlotBlocked(Long slotId) {
        repo.blockSlot(slotId);
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


    public List<SlotDto> previewSlots(Doctor doctor,
                                      LocalDate startDate,
                                      LocalDate endDate,
                                      LocalTime workStart,
                                      LocalTime workEnd,
                                      int slotTime) {
        Set<LocalDate> exceptionDays = exceptionDayRepo.findByDoctorIdAndDateBetween(
                        doctor.getId(),
                        startDate,
                        endDate)
                .stream()
                .map(ExceptionDay::getDate)
                .collect(Collectors.toSet());

        List<SlotDto> previewSlots = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            if (isExceptionDay(currentDate, exceptionDays)) {
                currentDate = currentDate.plusDays(1);
                continue;
            }

            if (!isWorkingDay(currentDate)) {
                currentDate = currentDate.plusDays(1);
                continue;
            }

            List<SlotDto> daySlots = previewSlotsForDay(doctor, currentDate, workStart, workEnd, slotTime);
            previewSlots.addAll(daySlots);
            currentDate = currentDate.plusDays(1);
        }

        return previewSlots;
    }

    private List<SlotDto> previewSlotsForDay(Doctor doctor,
                                             LocalDate date,
                                             LocalTime workStart,
                                             LocalTime workEnd,
                                             int slotTiem) {
        List<SlotDto> daySlots = new ArrayList<>();
        LocalDateTime current = LocalDateTime.of(date, workStart);
        LocalDateTime endOfWorkDay = LocalDateTime.of(date, workEnd);

        while (current.isBefore(endOfWorkDay)) {
            LocalDateTime slotEnd = current.plusMinutes(30);

            if (isRestTime(current,
                    this.restStart,
                    this.restEnd)) {
                current = slotEnd;
                continue;
            }

            if (slotEnd.isAfter(endOfWorkDay)) {
                break;
            }
            Slot virtualSlot = new Slot(doctor,
                    current,
                    slotTime);
            daySlots.add(toDto(virtualSlot));
            current = slotEnd;
        }

        return daySlots;
    }
    @Transactional
    public List<SlotDto> blockSlotsForDay(ExceptionDayDto dayDto, DoctorDto dto) {
        List<SlotDto> daySlots = new ArrayList<>();
        LocalDateTime current = LocalDateTime.of(dayDto.date(), LocalTime.of(8,0));
        LocalDateTime endOfWorkDay = LocalDateTime.of(dayDto.date(), LocalTime.of(18,30));

        for (var slot : this.getSlotsForCalendar(dto.id(), current, endOfWorkDay)) {
            Slot currentSlot = this.findById(slot.id());
            if (currentSlot.getStatus() == Status.FREE) {
                currentSlot.setStatus(Status.BLOCKED);
            }
        }


        return daySlots;
    }

    private Slot findById(Long id) {
        return this.repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Slot not found"));
    }


    public AppointmentDto toDto(Appointment appointment) {
        return new AppointmentDto(
                appointment.getId(),
                appointment.getSlot().getId(),
                appointment.getPatient().getId(),
                appointment.getDoctor().getId(),
                appointment.getSlot().getStartsAt(),
                appointment.getStatus(),
                null,
                appointment.getPriority(),
                appointment.getPatientName(),
                appointment.getPatientPhone()
        );
    }


    @Transactional(isolation = Isolation.READ_COMMITTED)
    public SlotDto changePatientOfSlot(Long slotId, String phone, String name, Long patientId) {
        Optional<User> user = this.patientsRepo.findById(patientId);
        Optional<Slot> slotEntity = this.repo.findById(slotId);
        List<Appointment> appointmentEntity = this.appointmentsRepo.findByPatientPhone(phone);
        if (appointmentEntity.size() == 0) {
            Appointment appointment = new Appointment();
            appointment.setStatus(AppointmentStatus.CONFIRMED);
            appointment.setPatientName(name);
            appointment.setPatientPhone(phone);
        }
        else {
            Appointment appointment = appointmentEntity.getLast();
            appointment.setPatientName(name);
            appointment.setPatientPhone(phone);
        }
        if (slotEntity.isEmpty()) {
            throw new EntityNotFoundException("No such slot");
        }
        Slot slot = slotEntity.get();
        if (user.isEmpty()) {
            slot.setPatientName(name);
        }

        repo.save(slot);
        return toDto(slot);

    }


    public List<Slot> findSlotsByDate(LocalDate date, Long doctorId) {
        LocalDateTime from = date.atTime(8,0);
        LocalDateTime to = date.atTime(20,0);
        return this.repo.findSlotsInDateRange(doctorId, from, to);
    }



}