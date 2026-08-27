package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PatientsRepo extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);


        @Query("SELECT u FROM User u WHERE RIGHT(u.phone, 5) = :lastFiveDigits")
        List<User> findByPhoneLastFiveDigits(@Param("lastFiveDigits") String lastFiveDigits);

}