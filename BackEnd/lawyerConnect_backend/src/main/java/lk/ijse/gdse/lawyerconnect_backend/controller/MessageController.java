package lk.ijse.gdse.lawyerconnect_backend.controller;

import lk.ijse.gdse.lawyerconnect_backend.dto.ApiResponse;
import lk.ijse.gdse.lawyerconnect_backend.dto.ChatMessageDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.ChatPartnerDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.SendMessageDTO;
import lk.ijse.gdse.lawyerconnect_backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse> sendMessage(Authentication authentication, @RequestBody SendMessageDTO sendMessageDTO) {
        String username = authentication.getName();
        ChatMessageDTO chatMessage = messageService.sendMessage(username, sendMessageDTO);
        return ResponseEntity.ok(new ApiResponse(200, "Message sent successfully", chatMessage));
    }

    @GetMapping("/conversation/{partnerId}")
    public ResponseEntity<ApiResponse> getConversation(Authentication authentication, @PathVariable Long partnerId) {
        String username = authentication.getName();
        List<ChatMessageDTO> conversation = messageService.getConversation(username, partnerId);
        return ResponseEntity.ok(new ApiResponse(200, "Conversation fetched successfully", conversation));
    }

    @GetMapping("/partners")
    public ResponseEntity<ApiResponse> getChatPartners(Authentication authentication) {
        String username = authentication.getName();
        List<ChatPartnerDTO> partners = messageService.getChatPartners(username);
        return ResponseEntity.ok(new ApiResponse(200, "Chat partners fetched successfully", partners));
    }
}
