package com.TriageScheduller.Triage.config;

import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.repo.DoctorsRepo;
import com.TriageScheduller.Triage.service.SlotsService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;

@Component
public class DataSeeder implements CommandLineRunner {
    private final DoctorsRepo doctorsRepo;
    private final SlotsService slotsService;

    public DataSeeder(DoctorsRepo doctorsRepo, SlotsService slotsService) {
        this.doctorsRepo = doctorsRepo;
        this.slotsService = slotsService;
    }


    @Override
    public void run(String... args) throws Exception {
        if (doctorsRepo.count() > 0) {
            return;
        }
        Doctor doc1 = new Doctor("Стоматология", "Д-р Иванов");
        doctorsRepo.save(doc1);
        LocalDate start = LocalDate.now();
        LocalDate end = start.plusDays(14);
        LocalTime workStart = LocalTime.of(9, 0);
        LocalTime workEnd = LocalTime.of(18, 0);

        slotsService.generateSlots(doc1, start, end, workStart, workEnd);
    }
}
