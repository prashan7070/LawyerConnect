package lk.ijse.gdse.lawyerconnect_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LawyerProfile{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToMany
    @JoinTable(
            name = "lawyer_has_specializations",
            joinColumns = @JoinColumn(name = "lawyer_id"),
            inverseJoinColumns = @JoinColumn(name = "specialization_id")
    )
    private List<Specialization> specializations;

    @OneToMany(mappedBy = "lawyer")
    private List<Appointment> appointments;
}
