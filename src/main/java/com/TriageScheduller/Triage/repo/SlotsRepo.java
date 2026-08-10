package com.TriageScheduller.Triage.repo;

import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.Slot;
import com.TriageScheduller.Triage.utils.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface SlotsRepo extends JpaRepository<Slot, Long> {

    boolean existsByDoctorAndStartsAt(Doctor doctor, LocalDateTime current);

    void updateStatusIfBooked(Long slotId, Status status);

    int updateStatusIfFree(Long slotId, Status status);

    List<Slot> findByDoctorIdAndStartsAtBetweenAndStatus(Long doctorId,
                                                         LocalDateTime from,
                                                         LocalDateTime to,
                                                         Status status);

    List<Slot> findByDoctorIdAndStartsAtBetween(Long doctorId,
                                                LocalDateTime from,
                                                LocalDateTime to);


}
