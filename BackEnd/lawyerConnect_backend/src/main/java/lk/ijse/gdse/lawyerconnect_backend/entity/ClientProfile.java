package lk.ijse.gdse.lawyerconnect_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phone;
    private String city;
    private String profilePictureUrl;
    private LocalDateTime dob;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "client")
    private List<Appointment> appointments;
}

