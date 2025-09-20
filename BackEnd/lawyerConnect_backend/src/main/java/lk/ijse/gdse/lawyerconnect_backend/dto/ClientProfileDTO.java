package lk.ijse.gdse.lawyerconnect_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ClientProfileDTO {

//    private Long id;
    private String fullName;
    private String email;
    private String address;
    private String phone;
    private String nic;
    private LocalDate dob;
    private String profilePictureUrl;


}
