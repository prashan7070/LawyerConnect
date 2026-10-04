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
    @Column(name = "role", length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private UserStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private LawyerProfile lawyerProfile;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private ClientProfile clientProfile;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = UserStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
