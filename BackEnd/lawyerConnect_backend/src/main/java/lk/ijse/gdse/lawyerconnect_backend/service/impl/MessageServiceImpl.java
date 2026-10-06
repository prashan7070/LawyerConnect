package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lk.ijse.gdse.lawyerconnect_backend.dto.ChatMessageDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.ChatPartnerDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.SendMessageDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.Message;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.exception.ResourceNotFoundException;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.MessageRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.UserRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final LawyerProfileRepository lawyerProfileRepository;

    @Override
    @Transactional
    public ChatMessageDTO sendMessage(String senderUsername, SendMessageDTO sendMessageDTO) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Sender user not found"));

        User receiver = userRepository.findById(sendMessageDTO.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver user not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setMessage(sendMessageDTO.getMessage());
        message.setSentAt(LocalDateTime.now());
        message.setRead(false);

        Message saved = messageRepository.save(message);

        return ChatMessageDTO.builder()
                .id(saved.getId())
                .senderId(sender.getUserId())
                .senderName(sender.getName())
                .receiverId(receiver.getUserId())
                .receiverName(receiver.getName())
                .message(saved.getMessage())
                .sentAt(saved.getSentAt())
                .isRead(saved.isRead())
                .build();
    }

    @Override
    @Transactional
    public List<ChatMessageDTO> getConversation(String currentUsername, Long partnerId) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        User partnerUser = userRepository.findById(partnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Partner user not found"));

        List<Message> conversation = messageRepository.findConversationBetweenUsers(currentUser, partnerUser);

        // Mark incoming messages from partner as read
        for (Message msg : conversation) {
            if (msg.getReceiver().getUserId().equals(currentUser.getUserId()) && !msg.isRead()) {
                msg.setRead(true);
                messageRepository.save(msg);
            }
        }

        return conversation.stream()
                .map(m -> ChatMessageDTO.builder()
                        .id(m.getId())
                        .senderId(m.getSender().getUserId())
                        .senderName(m.getSender().getName())
                        .receiverId(m.getReceiver().getUserId())
                        .receiverName(m.getReceiver().getName())
                        .message(m.getMessage())
                        .sentAt(m.getSentAt())
                        .isRead(m.isRead())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatPartnerDTO> getChatPartners(String currentUsername) {
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        List<User> partners = messageRepository.findChatPartners(currentUser);
        List<ChatPartnerDTO> partnerDTOs = new ArrayList<>();

        for (User partner : partners) {
            List<Message> latestMessages = messageRepository.findLatestMessageBetweenUsers(currentUser, partner);
            Message lastMsg = latestMessages.isEmpty() ? null : latestMessages.get(0);

            String avatarUrl = null;
            if (partner.getRole() != null && "LAWYER".equalsIgnoreCase(partner.getRole().name())) {
                avatarUrl = lawyerProfileRepository.findByUser(partner)
                        .map(LawyerProfile::getProfilePictureUrl)
                        .orElse(null);
            }

            partnerDTOs.add(ChatPartnerDTO.builder()
                    .id(partner.getUserId())
                    .name(partner.getName())
                    .username(partner.getUsername())
                    .role(partner.getRole() != null ? partner.getRole().name() : "USER")
                    .avatarUrl(avatarUrl)
                    .lastMessage(lastMsg != null ? lastMsg.getMessage() : "")
                    .lastMessageTime(lastMsg != null ? lastMsg.getSentAt() : null)
                    .build());
        }

        return partnerDTOs;
    }
}
