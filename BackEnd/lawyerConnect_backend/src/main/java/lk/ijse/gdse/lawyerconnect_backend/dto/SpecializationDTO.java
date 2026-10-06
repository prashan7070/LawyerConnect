package lk.ijse.gdse.lawyerconnect_backend.dto;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class SpecializationDTO implements java.io.Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String specialization;

}
