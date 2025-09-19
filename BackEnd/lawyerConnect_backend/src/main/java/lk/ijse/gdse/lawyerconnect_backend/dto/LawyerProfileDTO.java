package lk.ijse.gdse.lawyerconnect_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class LawyerProfileDTO {

    private Long id;
    private String fullName;
    private String email;
    private String workingAddress;
    private String phone;
    private String specialties;
    private int yearsOfExperience;
    private String licenceNumber;
    private String bio;
    private String profilePictureUrl;
    private BigDecimal onlineFee;
    private BigDecimal inPersonFee;

    private List<Long> specializationIds;


}
