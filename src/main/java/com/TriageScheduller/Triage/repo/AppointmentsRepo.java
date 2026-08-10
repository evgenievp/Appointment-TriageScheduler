package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentsRepo extends JpaRepository<Appointment, Long> {

}
