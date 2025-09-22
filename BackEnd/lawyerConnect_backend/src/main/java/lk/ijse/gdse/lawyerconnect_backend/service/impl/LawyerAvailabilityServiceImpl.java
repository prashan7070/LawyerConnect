package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lk.ijse.gdse.lawyerconnect_backend.dto.AvailabilityDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.TimeSlotDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.Appointment;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerAvailability;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.exception.ResourceNotFoundException;
import lk.ijse.gdse.lawyerconnect_backend.repository.AppointmentRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerAvailabilityRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerAvailabilityService;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerExploreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LawyerAvailabilityServiceImpl implements LawyerAvailabilityService {


    private final LawyerAvailabilityRepository availabilityRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotDTO> getAvailableSlots(Long lawyerId, LocalDate date, int slotMinutes) {
        LawyerProfile lawyer = lawyerProfileRepository.findById(lawyerId)
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found"));

        DayOfWeek dayOfWeek = date.getDayOfWeek();

        List<LawyerAvailability> availabilities =
                availabilityRepository.findByLawyerProfileAndDayOfWeek(lawyer, dayOfWeek);

        List<TimeSlotDTO> availableSlots = new ArrayList<>();


        if (availabilities.isEmpty()) return availableSlots;

        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();

        List<Appointment> appointmentsForDay = appointmentRepository.findByLawyerAndScheduledAtBetween(lawyer, dayStart, dayEnd);

        for (LawyerAvailability availability : availabilities) {
            LocalTime iter = availability.getStartTime();
            LocalTime end = availability.getEndTime();

            while (!iter.plusMinutes(slotMinutes).isAfter(end)) {
                LocalTime slotEnd = iter.plusMinutes(slotMinutes);

                LocalDateTime slotStartDateTime = LocalDateTime.of(date, iter);
                LocalDateTime slotEndDateTime = LocalDateTime.of(date, slotEnd);

                // check overlap with existing appointments
                boolean overlaps = appointmentsForDay.stream().anyMatch(appt -> {
                    LocalDateTime apptStart = appt.getScheduledAt();
                    LocalDateTime apptEnd = apptStart.plusMinutes(appt.getDurationMinutes());

                    return apptStart.isBefore(slotEndDateTime) && apptEnd.isAfter(slotStartDateTime);
                });

                if (!overlaps) {
                    availableSlots.add(new TimeSlotDTO(date, iter, slotEnd));
                }

                iter = iter.plusMinutes(slotMinutes);
            }
        }

        return availableSlots;
    }
}
