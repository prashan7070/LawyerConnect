package lk.ijse.gdse.lawyerconnect_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class LawyerProfileDTO {

    private String fullName;
    private String email;
    private String workingAddress;
    private String phone;
    private String specialties;
    private int yearsOfExperience;
    private String licenceNumber;
    private String bio;
    private String profilePictureUrl;


}
