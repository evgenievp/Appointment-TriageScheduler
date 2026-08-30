package com.TriageScheduller.Triage.config;

import com.TriageScheduller.Triage.dto.DoctorDto;
import com.TriageScheduller.Triage.dto.RegisterRequest;
import com.TriageScheduller.Triage.models.Appointment;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.repo.DoctorsRepo;
import com.TriageScheduller.Triage.repo.PatientsRepo;
import com.TriageScheduller.Triage.service.*;
import com.TriageScheduller.Triage.utils.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import com.TriageScheduller.Triage.models.User;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {
    private final DoctorsRepo doctorsRepo;
    private final SlotsService slotsService;
    private final AppointmentsService appointmentsService;
    private final PatientsRepo patientsRepo;
    private final PatientsService patientsService;
    private final AuthService authService;
    private final DoctorsService doctorsService;

    public DataSeeder(DoctorsRepo doctorsRepo,
                      SlotsService slotsService,
                      AppointmentsService appointmentsService,
                      PatientsRepo patientsRepo,
                      PatientsService patientsService, AuthService authService, DoctorsService doctorsService) {
        this.doctorsRepo = doctorsRepo;
        this.slotsService = slotsService;
        this.appointmentsService = appointmentsService;
        this.patientsRepo = patientsRepo;
        this.patientsService = patientsService;

        this.authService = authService;
        this.doctorsService = doctorsService;
    }


    @Override
    public void run(String... args) throws Exception {


        if (doctorsRepo.count() == 0) {
            //working settings
            LocalDate start = LocalDate.of(2026, 8, 11);
            LocalDate end = start.plusDays(30);
            LocalTime workStart = LocalTime.of(9, 0);
            LocalTime workEnd = LocalTime.of(18, 0);



            RegisterRequest register1 = new RegisterRequest(
                    "ivan@abv.bg",
                    "123456789",
                    "ivan",
                    "0889 888 888");

            RegisterRequest register2 = new RegisterRequest(
                    "georgi@abv.bg",
                    "123456789",
                    "georgi",
                    "0889 888 887");
            RegisterRequest register3 = new RegisterRequest(
                    "todor@abv.bg",
                    "123456789",
                    "todor",
                    "0889 888 886");

            authService.register(register1);
            authService.register(register2);
            authService.register(register3);


            User georgi =patientsService.findByEmail("georgi@abv.bg");
            patientsService.findByEmail("ivan@abv.bg");
            patientsService.findByEmail("todor@abv.bg");

            patientsService.promoteToStaff(georgi.getEmail());
            DoctorDto doc1 = patientsService.promoteToDoctor("georgi@abv.bg", "Педиатър");
            DoctorDto doc2 = patientsService.promoteToDoctor("todor@abv.bg", "Кардиолог");

            Doctor drIvan = doctorsService.toDoctor(doc1);
            Doctor drTodor = doctorsService.toDoctor(doc2);

            slotsService.generateSlots(drIvan, start, end, workStart, workEnd);

            slotsService.generateSlots(drTodor, start, end, workStart, workEnd);

        }




    }
}
