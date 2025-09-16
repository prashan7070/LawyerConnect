package lk.ijse.gdse.lawyerconnect_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ConsultationType consultationType;

    private int durationMinutes;
    private String location;
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String notes;

    @ManyToOne
    @JoinColumn(name = "lawyer_id")
    private LawyerProfile lawyer;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private ClientProfile client;

    @OneToOne(mappedBy = "appointment")
    private Payment payment;
}
