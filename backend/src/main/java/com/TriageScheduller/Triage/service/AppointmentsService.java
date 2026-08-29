package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.AppointmentDto;
import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.exception.ForbiddenException;
import com.TriageScheduller.Triage.models.Appointment;
import com.TriageScheduller.Triage.models.Slot;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.repo.AppointmentsRepo;
import com.TriageScheduller.Triage.repo.DoctorsRepo;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.repo.SlotsRepo;
import com.TriageScheduller.Triage.utils.AppointmentStatus;
import com.TriageScheduller.Triage.utils.Priority;
import com.TriageScheduller.Triage.utils.Status;
import jakarta.persistence.EntityNotFoundException;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;



@Service
public class AppointmentsService {
    private final AppointmentsRepo appointmentsRepo;
    private final SlotsRepo slotsRepo;
    private final SlotsService slotsService;
    private final PatientsRepo patientsRepo;
    private final DoctorsRepo doctorsRepo;

    public AppointmentsService(AppointmentsRepo appointmentsRepo,
                               SlotsRepo slotsRepo,
                               SlotsService slotsService,
                               PatientsRepo patientsRepo,
                               DoctorsRepo doctorsRepo) {
        this.appointmentsRepo = appointmentsRepo;
        this.slotsRepo = slotsRepo;
        this.slotsService = slotsService;
        this.patientsRepo = patientsRepo;
        this.doctorsRepo = doctorsRepo;
    }

    public Appointment createAppointment(Long slotId, User patient, Doctor doctor) {
        Slot slot = slotsRepo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        Appointment appointment = new Appointment();
        appointment.setSlot(slot);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setPriority(Priority.NORMAL);

        return appointmentsRepo.save(appointment);
    }

    public Appointment findById(Long id) {
        return appointmentsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    public List<AppointmentDto> findByPatientId(Long patientId) {
        List<AppointmentDto> dtos = new ArrayList<>();

        for (var appo : this.appointmentsRepo.findByPatientId(patientId)) {
            dtos.add(toDto(appo));
        }
        return dtos;
    }

    @Transactional
    public void delete(Long appointmentId, String userEmail, boolean isStaff) {
        Appointment appointment = appointmentsRepo.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!isStaff && !appointment.getPatient().getEmail().equals(userEmail)) {
            throw new ForbiddenException("You are not authorized to cancel this appointment");
        }

        Slot slot = appointment.getSlot();

        slot.setStatus(Status.FREE);
        slot.setPatientId(null);
        slotsRepo.save(slot);

        appointmentsRepo.deleteById(appointmentId);
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
    public SlotDto changePatient(Long newPatientId, Long slotId, String phone) {

        User newPatient = patientsRepo.findById(newPatientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Slot slot = slotsRepo.findById(slotId)
                .orElseThrow(() -> new EntityNotFoundException("Slot not found"));

        Appointment appointment = appointmentsRepo.findBySlotId(slotId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        slot.setStatus(Status.BOOKED);
        slot.setPatientId(newPatientId);
        slotsRepo.save(slot);


        appointment.setPatient(newPatient);
        appointment.setPatientPhone(phone);
        appointment.setPatientName(newPatient.getName());

        appointmentsRepo.save(appointment);

        return slotsService.toDto(slot);

    }

    public List<AppointmentDto> findByDoctorId(Long id) {
        List<AppointmentDto> dtos = new ArrayList<>();
        for (var appointment: this.appointmentsRepo.findByDoctorId(id)) {
            dtos.add(toDto(appointment));
        }
        return dtos;
    }

    public @Nullable List<AppointmentDto> findAll() {
        List<AppointmentDto> dtos = new ArrayList<>();
        for (var appointment: this.appointmentsRepo.findAll()) {
            dtos.add(toDto(appointment));
        }
        return dtos;
    }

    public List<AppointmentDto> getAppointmentsForTheDay(LocalDate date) {
        List<AppointmentDto> dtos = new ArrayList<>();

        for (var appointment : this.appointmentsRepo.findByDate(date)) {
            dtos.add(toDto(appointment));
        }
        return dtos;
    }

    public List<AppointmentDto> findByDoctorAuthentication(Authentication authentication) {

        Doctor doctor = this.doctorsRepo.findByEmail(authentication.getName())
                .orElseThrow(() -> new EntityNotFoundException("No such doctor"));
        List<AppointmentDto> dtos = new ArrayList<>();

        for (var appointment : this.appointmentsRepo.findByDoctorId(doctor.getId())) {
            dtos.add(toDto(appointment));
        }
        return dtos;

    }
}