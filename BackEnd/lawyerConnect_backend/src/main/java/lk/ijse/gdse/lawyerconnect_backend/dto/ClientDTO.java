package lk.ijse.gdse.lawyerconnect_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClientDTO {

    private Long clientId;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private String clientProfilePicture;

}
