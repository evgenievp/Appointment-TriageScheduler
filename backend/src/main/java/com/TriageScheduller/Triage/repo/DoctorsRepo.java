package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface DoctorsRepo extends JpaRepository<Doctor, Long> {

    @Query(value = "select * from doctor order by random() limit 5", nativeQuery = true)
    List<Doctor> findRandomDoctors();


    Optional<Doctor> findByEmail(String email);
}