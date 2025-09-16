package lk.ijse.gdse.lawyerconnect_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int rating;
    @Column(columnDefinition = "TEXT")
    private String feedback;
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "lawyer_id")
    private LawyerProfile lawyer;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private ClientProfile client;
}
