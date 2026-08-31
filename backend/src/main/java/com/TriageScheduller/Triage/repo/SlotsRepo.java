package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.Slot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SlotsRepo extends JpaRepository<Slot, Long> {

    boolean existsByDoctorAndStartsAt(Doctor doctor, LocalDateTime startsAt);

    @Query("SELECT s FROM Slot s WHERE s.doctor.id = :doctorId " +
            "AND s.startsAt BETWEEN :from AND :to " +
            "AND s.status = 'FREE'")
    List<Slot> findFreeSlots(@Param("doctorId") Long doctorId,
                             @Param("from") LocalDateTime from,
                             @Param("to") LocalDateTime to);

    @Modifying
    @Transactional
    @Query("UPDATE Slot s SET s.status = 'BOOKED' WHERE s.id = :slotId AND s.status = 'FREE'")
    int bookSlot(@Param("slotId") Long slotId);

    @Modifying
    @Transactional
    @Query("UPDATE Slot s SET s.status = 'FREE' WHERE s.id = :slotId AND s.status = 'BOOKED'")
    int freeSlot(@Param("slotId") Long slotId);

    List<Slot> findByDoctorIdAndStartsAtBetween(Long doctorId,
                                                LocalDateTime from,
                                                LocalDateTime to);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Slot s SET s.status = 'BOOKED', s.patientId = :patientId " +
            "WHERE s.id = :slotId AND s.status = 'FREE'")
    int bookSlot(@Param("slotId") Long slotId, @Param("patientId") Long patientId);


    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Slot s SET s.status = 'BLOCKED' WHERE s.id = :slotId AND s.status = 'FREE'")
    void blockSlot(@Param("slotId") Long slotId);


    @Query("SELECT s FROM Slot s WHERE s.doctor.id = :doctorId AND s.startsAt BETWEEN :from AND :to")
    List<Slot> findSlotsInDateRange(@Param("doctorId") Long doctorId,
                                    @Param("from") LocalDateTime from,
                                    @Param("to") LocalDateTime to);

}