package lk.ijse.gdse.lawyerconnect_backend.dto;

import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class AvailabilityDTO {

    private DayOfWeek dayOfWeek;      // e.g. 2025-09-15
    private LocalTime startTime;  // e.g. 09:00
    private LocalTime endTime;    // e.g. 17:00


}
