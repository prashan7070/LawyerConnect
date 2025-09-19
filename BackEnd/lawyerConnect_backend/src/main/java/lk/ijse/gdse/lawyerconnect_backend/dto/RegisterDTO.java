package lk.ijse.gdse.lawyerconnect_backend.dto;

import lombok.*;

@Data
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RegisterDTO {
    private String name;
    private String username;
    private String password;
    private String email;
    private String role;
}
