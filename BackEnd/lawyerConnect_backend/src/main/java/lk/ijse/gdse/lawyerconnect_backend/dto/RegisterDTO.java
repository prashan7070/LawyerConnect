package lk.ijse.gdse.lawyerconnect_backend.dto;

import lombok.Data;
import lombok.ToString;

@Data
@ToString
public class RegisterDTO {
    private String name;
    private String username;
    private String password;
    private String email;
    private String role;
}
