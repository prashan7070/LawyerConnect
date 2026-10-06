package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.dto.ChatMessageDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.ChatPartnerDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.SendMessageDTO;

import java.util.List;

public interface MessageService {
    ChatMessageDTO sendMessage(String senderUsername, SendMessageDTO sendMessageDTO);
    List<ChatMessageDTO> getConversation(String currentUsername, Long partnerId);
    List<ChatPartnerDTO> getChatPartners(String currentUsername);
}
