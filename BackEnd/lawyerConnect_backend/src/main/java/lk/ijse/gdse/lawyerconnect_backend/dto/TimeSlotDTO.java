package lk.ijse.gdse.lawyerconnect_backend.dto;


import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class TimeSlotDTO {

    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

}
