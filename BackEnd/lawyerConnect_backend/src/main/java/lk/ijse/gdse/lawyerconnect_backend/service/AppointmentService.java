package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.dto.BookAppointmentRequestDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.BookAppointmentResponseDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;

public interface AppointmentService {

    BookAppointmentResponseDTO bookAppointment(BookAppointmentRequestDTO request, User user);

}
