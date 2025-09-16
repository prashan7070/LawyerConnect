package lk.ijse.gdse.lawyerconnect_backend.dto;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.NamedEntityGraph;
import lk.ijse.gdse.lawyerconnect_backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

public class UserDTO {

    private Long userId;
    private String name;
    private String username;
    private String password;
    private String email;
    private String role;


}
