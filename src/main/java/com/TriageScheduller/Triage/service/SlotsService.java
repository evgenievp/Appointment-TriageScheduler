package com.TriageScheduller.Triage.service;

import com.TriageScheduller.Triage.dto.SlotDto;
import com.TriageScheduller.Triage.models.Doctor;
import com.TriageScheduller.Triage.models.Slot;
import com.TriageScheduller.Triage.repo.SlotsRepo;
import com.TriageScheduller.Triage.utils.Status;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class SlotsService {
    private final SlotsRepo repo;

    public SlotsService(SlotsRepo repo) {
        this.repo = repo;
    }

    @Transactional
    public List<SlotDto> generateSlots(Doctor doctor,
                                       LocalDate startDate,
                                       LocalDate endDate,
                                       LocalTime workStart,
                                       LocalTime workEnd) {

        List<SlotDto> dtos = new ArrayList<>();
        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            LocalDateTime current = LocalDateTime.of(currentDate, workStart);
            LocalDateTime endOfWorkDay = LocalDateTime.of(currentDate, workEnd);

            while (current.isBefore(endOfWorkDay)) {
                LocalDateTime slotEnd = current.plusMinutes(30);

                if (slotEnd.isAfter(endOfWorkDay)) {
                    break;
                }

                boolean exists = repo.existsByDoctorAndStartsAt(doctor, current);
                if (!exists) {
                    Slot slot = new Slot(doctor, current);
                    dtos.add(toDto(repo.save(slot)));
                }

                current = slotEnd;
            }
            currentDate = currentDate.plusDays(1);

        }

        return dtos;

    }

    public List<Slot> findFreeSlots(Long doctorId,
                                    LocalDateTime from,
                                    LocalDateTime to) {
        return repo.findByDoctorIdAndStartsAtBetweenAndStatus(
                doctorId, from, to, Status.FREE
        );
    }

    @Transactional
    public Slot bookSlot(Long slotId) {
        int updated = repo.updateStatusIfFree(slotId, Status.BOOKED);

        if (updated == 0) {
            throw new RuntimeException("Slot already booked or not found");
        }

        return repo.findById(slotId)
                .orElseThrow(() -> new RuntimeException("Slot not found"));
    }

    @Transactional
    public void freeSlot(Long slotId) {
        repo.updateStatusIfBooked(slotId, Status.FREE);
    }

    public List<SlotDto> getSlotsForCalendar(Long doctorId,
                                             LocalDateTime from,
                                             LocalDateTime to) {
        List<Slot> slots = repo.findByDoctorIdAndStartsAtBetween(
                doctorId, from, to
        );

        return slots.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

    }

    public SlotDto toDto(Slot slot) {
        return new SlotDto(
                slot.getId(),
                slot.getStartsAt(),
                slot.getEndsAt(),
                slot.getStatus(),
                slot.getDoctor().getId()
        );
    }
}
