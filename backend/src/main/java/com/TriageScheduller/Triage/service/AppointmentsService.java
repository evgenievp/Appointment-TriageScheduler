package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.AppointmentDto;
import com.TriageScheduller.Triage.models.Appointment;
import com.TriageScheduller.Triage.models.Slot;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.repo.AppointmentsRepo;
import com.TriageScheduller.Triage.repo.SlotsRepo;
import com.TriageScheduller.Triage.utils.AppointmentStatus;
import com.TriageScheduller.Triage.utils.Priority;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentsService {
    private final AppointmentsRepo appointmentsRepo;
    private final SlotsRepo slotsRepo;
    private final SlotsService slotsService;

    public AppointmentsService(AppointmentsRepo appointmentsRepo,
                               SlotsRepo slotsRepo,
                               SlotsService slotsService) {
        this.appointmentsRepo = appointmentsRepo;
        this.slotsRepo = slotsRepo;
        this.slotsService = slotsService;
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

    public void delete(Long id) {
        slotsService.freeSlot(id);
        appointmentsRepo.deleteById(id);
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
                appointment.getPriority()
        );
    }
}