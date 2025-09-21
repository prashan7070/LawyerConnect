package lk.ijse.gdse.lawyerconnect_backend.dto;

import lk.ijse.gdse.lawyerconnect_backend.entity.AppointmentStatus;
import lk.ijse.gdse.lawyerconnect_backend.entity.ConsultationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentDTO {
    private Long appointmentId;
    private Long lawyerId;
    private String lawyerName;
    private String clientName;
    private String lawyerPhone;
    private Long clientId;
    private String date;
    private String startTime;
    private String endTime;
    private ConsultationType consultationType;
    private AppointmentStatus status;
    private String notes;
}