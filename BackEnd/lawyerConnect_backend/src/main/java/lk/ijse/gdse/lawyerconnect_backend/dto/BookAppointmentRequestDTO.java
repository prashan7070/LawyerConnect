package lk.ijse.gdse.lawyerconnect_backend.dto;

import lk.ijse.gdse.lawyerconnect_backend.entity.ConsultationType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookAppointmentRequestDTO {

    private Long lawyerId;
    private String date;                               // YYYY-MM-DD
    private String startTime;                         // HH:mm
    private ConsultationType consultationType;
    private String location;                           // Online/Physical
    private String notes;


}
