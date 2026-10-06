package lk.ijse.gdse.lawyerconnect_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatPartnerDTO {
    private Long id;
    private String name;
    private String username;
    private String role;
    private String avatarUrl;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
}
