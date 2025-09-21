package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.dto.AvailabilityDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.TimeSlotDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;

import java.time.LocalDate;
import java.util.List;

public interface LawyerAvailabilityService {


    List<TimeSlotDTO> getAvailableSlots(Long lawyerId, LocalDate date, int slotMinutes);

}
