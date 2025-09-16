package lk.ijse.gdse.lawyerconnect_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String name;
    private String username;
    private String password;
    private String email;

//    @Enumerated(EnumType.STRING)
//    private Gender gender;


    @Enumerated(EnumType.STRING)
    private Role role;

//    private LocalDateTime createdAt;
//    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user")
    private LawyerProfile lawyerProfile;

    @OneToOne(mappedBy = "user")
    private ClientProfile clientProfile;


}
