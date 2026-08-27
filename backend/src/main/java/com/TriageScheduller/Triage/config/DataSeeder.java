package com.TriageScheduller.Triage.config;

import com.TriageScheduller.Triage.models.Appointment;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.repo.DoctorsRepo;
import com.TriageScheduller.Triage.service.AppointmentsService;
import com.TriageScheduller.Triage.service.SlotsService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.TriageScheduller.Triage.models.User;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataSeeder implements CommandLineRunner {
    private final DoctorsRepo doctorsRepo;
    private final SlotsService slotsService;
    private final AppointmentsService appointmentsService;

    public DataSeeder(DoctorsRepo doctorsRepo, SlotsService slotsService, AppointmentsService appointmentsService) {
        this.doctorsRepo = doctorsRepo;
        this.slotsService = slotsService;
        this.appointmentsService = appointmentsService;
    }


    @Override
    public void run(String... args) throws Exception {
        if (doctorsRepo.count() > 0) {
            return;
        }
        Doctor doc1 = new Doctor("Д-р Иванов", "Стоматология" );
        Appointment appointment = new Appointment();
        User gosho = new User(
            "gosho@abv.bg",
                "12345678",
                "gosho",
                "0888 888 808"

        );

        appointment.setDoctor(doc1);
        appointment.setPatient(gosho);

        doctorsRepo.save(doc1);
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(14);
        LocalTime workStart = LocalTime.of(9, 0);
        LocalTime workEnd = LocalTime.of(18, 0);

        slotsService.generateSlots(doc1, start, end, workStart, workEnd);
    }
}
