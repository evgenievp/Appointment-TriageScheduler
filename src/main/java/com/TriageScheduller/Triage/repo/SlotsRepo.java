package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.Slot;
import com.TriageScheduller.Triage.utils.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface SlotsRepo extends JpaRepository<Slot, Long> {

    boolean existsByDoctorAndStartsAt(Doctor doctor, LocalDateTime current);

    @Modifying
    @Transactional
    @Query("update Slot s set s.status = :status where s.id = :slotId and s.status = 'BOOKED'")
    int updateStatusIfBooked(@Param("slotId") Long slotId, @Param("status") Status status);

    @Modifying
    @Transactional
    @Query("update Slot s set s.status = :status where s.id = :slotId and s.status = 'FREE'")
    int updateStatusIfFree(@Param("slotId") Long slotId, @Param("status") Status status);

    List<Slot> findByDoctorIdAndStartsAtBetweenAndStatus(Long doctorId,
                                                         LocalDateTime from,
                                                         LocalDateTime to,
                                                         Status status);

    List<Slot> findByDoctorIdAndStartsAtBetween(Long doctorId,
                                                LocalDateTime from,
                                                LocalDateTime to);
}