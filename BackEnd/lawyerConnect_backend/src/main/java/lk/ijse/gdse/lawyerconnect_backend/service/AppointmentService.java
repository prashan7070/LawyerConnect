package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.dto.*;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;

import java.util.List;

public interface AppointmentService {

    BookAppointmentResponseDTO bookAppointment(BookAppointmentRequestDTO request, User user);
    List<AppointmentDTO> getClientAppointments(User user);
    List<AppointmentDTO> getLawyerAppointments(User user);

    void updateAppointmentStatus(String appointmentId, UpdateStatusRequestDTO dto);
    List<ClientDTO> getClientsOfLawyer(User user);

}
