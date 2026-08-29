package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import javax.print.Doc;
import java.util.List;
import java.util.Optional;

public interface DoctorsRepo extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByUser(User user);


    @Query(value = "select * from doctor order by random() limit 5", nativeQuery = true)
    List<Doctor> findRandomDoctors();

    Optional<Doctor> findByEmail(String email);
}