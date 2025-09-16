package lk.ijse.gdse.lawyerconnect_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Specialization {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String specialization;
    private String description;

    @ManyToMany(mappedBy = "specializations")
    private List<LawyerProfile> lawyers;
}
