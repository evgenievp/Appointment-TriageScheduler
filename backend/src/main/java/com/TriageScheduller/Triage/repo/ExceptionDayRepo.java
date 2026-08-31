package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.ExceptionDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExceptionDayRepo extends JpaRepository<ExceptionDay, Long> {
    List<ExceptionDay> findByDoctorId(Long doctorId);
    List<ExceptionDay> findByDoctorIdAndDateBetween(Long doctorId, LocalDate from, LocalDate to);
    boolean existsByDoctorIdAndDate(Long doctorId, LocalDate date);

    Optional<ExceptionDay> findById(Long id);

}