package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.models.Appointment;
import com.TriageScheduller.Triage.models.Slot;
import com.TriageScheduller.Triage.models.User;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.repo.AppointmentsRepo;
import com.TriageScheduller.Triage.repo.SlotsRepo;
import com.TriageScheduller.Triage.utils.AppointmentStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentsService {
    private final AppointmentsRepo appointmentsRepo;
    private final SlotsRepo slotsRepo;

    public AppointmentsService(AppointmentsRepo appointmentsRepo, SlotsRepo slotsRepo) {
        this.appointmentsRepo = appointmentsRepo;
        this.slotsRepo = slotsRepo;
    }

    public Appointment createAppointment(Long slotId, User patient, Doctor doctor) {
        Slot slot = slotsRepo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        Appointment appointment = new Appointment();
        appointment.setSlot(slot);
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setStatus(AppointmentStatus.CONFIRMED);

        return appointmentsRepo.save(appointment);
    }

    public Appointment findById(Long id) {
        return appointmentsRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    public List<Appointment> findByPatientId(Long patientId) {
        return appointmentsRepo.findByPatientId(patientId);
    }

    public void delete(Long id) {
        appointmentsRepo.deleteById(id);
    }
}