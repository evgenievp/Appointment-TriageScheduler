package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AppointmentsRepo extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);

    Optional<Appointment> findBySlotId(Long slotId);


    @Query("SELECT a FROM Appointment a WHERE DATE(a.slot.startsAt) = :date")
    List<Appointment> findByDate(@Param("date") LocalDate date);


}