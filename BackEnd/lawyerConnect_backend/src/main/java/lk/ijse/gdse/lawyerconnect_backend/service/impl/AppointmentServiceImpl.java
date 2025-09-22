package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lk.ijse.gdse.lawyerconnect_backend.dto.*;
import lk.ijse.gdse.lawyerconnect_backend.entity.*;
import lk.ijse.gdse.lawyerconnect_backend.exception.AllReadyFoundException;
import lk.ijse.gdse.lawyerconnect_backend.exception.InvalidAppointmentStatusException;
import lk.ijse.gdse.lawyerconnect_backend.exception.ResourceNotFoundException;
import lk.ijse.gdse.lawyerconnect_backend.repository.AppointmentRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.ClientProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.PaymentRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final ClientProfileRepository clientProfileRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public BookAppointmentResponseDTO bookAppointment(BookAppointmentRequestDTO request, User user) {

        ClientProfile profile = clientProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        LawyerProfile lawyer = lawyerProfileRepository.findById(request.getLawyerId())
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found"));

        ClientProfile client = clientProfileRepository.findById(profile.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        // Parse date/time
        LocalDate date = LocalDate.parse(request.getDate());
        LocalTime startTime = LocalTime.parse(request.getStartTime());
        int duration = 60; // 1-hour default

        LocalDateTime startDateTime = LocalDateTime.of(date, startTime);
        LocalDateTime endDateTime = startDateTime.plusMinutes(duration);

        // Check if slot is already booked
        List<Appointment> existing = appointmentRepository.findByLawyerAndScheduledAtBetween(
                lawyer, startDateTime, endDateTime
        );
        if (!existing.isEmpty()) {
            throw new AllReadyFoundException("Selected time slot is already booked.");
        }

        // Determine fee
        BigDecimal amount = request.getConsultationType() == ConsultationType.ONLINE
                ? lawyer.getOnlineFee() : lawyer.getInPersonFee();

        // Create appointment
        Appointment appointment = Appointment.builder()
                .lawyer(lawyer)
                .client(client)
                .scheduledAt(startDateTime)
                .durationMinutes(duration)
                .consultationType(request.getConsultationType())
                .location(request.getLocation())
                .status(AppointmentStatus.PENDING)
                .notes(request.getNotes())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        appointmentRepository.save(appointment);

        // Create payment (fake / UI only)
        Payment payment = Payment.builder()
                .appointment(appointment)
                .amount(amount)
                .paymentMethod("FAKE_CARD")
                .transactionId(UUID.randomUUID().toString())
                .paidAt(LocalDateTime.now())
                .build();

        paymentRepository.save(payment);

        // Response DTO
        return new BookAppointmentResponseDTO(
                appointment.getId(),
                lawyer.getId(),
                client.getId(),
                request.getDate(),
                request.getStartTime(),
                endDateTime.toLocalTime().toString(),
                request.getConsultationType(),
                appointment.getStatus()
        );
    }



    public List<AppointmentDTO> getClientAppointments(User user) {

        ClientProfile client = clientProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        List<Appointment> appointments = appointmentRepository.findByClientId(client.getId());

        if (appointments.isEmpty()){
            throw new ResourceNotFoundException("client doesn't have any appointments");
        }

        return appointments.stream().map(app -> AppointmentDTO.builder()
                .appointmentId(app.getId())
                .lawyerId(app.getLawyer().getId())
                .lawyerName(app.getLawyer().getFullName())
                .clientName(app.getClient().getFullName())
                .lawyerPhone(app.getLawyer().getPhone())
                .clientPhone(app.getClient().getPhone())
                .clientProfileUrl(app.getClient().getProfilePictureUrl())
                .lawyerProfileUrl(app.getLawyer().getProfilePictureUrl())
                .clientId(app.getClient().getId())
                .date(app.getScheduledAt().toLocalDate().toString())
                .startTime(app.getScheduledAt().toLocalTime().toString())
                .endTime(app.getScheduledAt().plusMinutes(app.getDurationMinutes()).toLocalTime().toString())
                .consultationType(app.getConsultationType())
                .status(app.getStatus())
                .notes(app.getNotes())
                .build()
        ).toList();

    }

    @Override
    public List<AppointmentDTO> getLawyerAppointments(User user) {
        LawyerProfile profile = lawyerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        List<Appointment> appointments = appointmentRepository.findByLawyerId(profile.getId());

        if (appointments.isEmpty()){
            throw new ResourceNotFoundException("lawyer doesn't have any appointments");
        }

        return appointments.stream().map(app -> AppointmentDTO.builder()
                .appointmentId(app.getId())
                .lawyerId(app.getLawyer().getId())
                .lawyerName(app.getLawyer().getFullName())
                .clientName(app.getClient().getFullName())
                .lawyerPhone(app.getLawyer().getPhone())
                .clientPhone(app.getClient().getPhone())
                .clientProfileUrl(app.getClient().getProfilePictureUrl())
                .lawyerProfileUrl(app.getLawyer().getProfilePictureUrl())
                .clientId(app.getClient().getId())
                .date(app.getScheduledAt().toLocalDate().toString())
                .startTime(app.getScheduledAt().toLocalTime().toString())
                .endTime(app.getScheduledAt().plusMinutes(app.getDurationMinutes()).toLocalTime().toString())
                .consultationType(app.getConsultationType())
                .status(app.getStatus())
                .notes(app.getNotes())
                .build()
        ).toList();
    }

    @Override
    public void updateAppointmentStatus(String appointmentId, UpdateStatusRequestDTO dto) {

        Appointment appointment = appointmentRepository.findById(Long.valueOf(appointmentId))
                .orElseThrow(() -> new ResourceNotFoundException("appointment not found"));

        AppointmentStatus newStatus;

        try {
            newStatus = AppointmentStatus.valueOf(dto.getStatus().trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
//            throw new RuntimeException("Invalid status value");
            throw new InvalidAppointmentStatusException("Invalid status value");
        }

        appointment.setStatus(newStatus); // or appointment.setStatus(newStatus) if your entity uses the enum
        appointmentRepository.save(appointment);

    }


    public List<ClientDTO> getClientsOfLawyer(User user) {

        LawyerProfile lawyer = lawyerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer not found"));

        List<Appointment> appointments = appointmentRepository.findByLawyerId(lawyer.getId());

        Map<Long, ClientDTO> clientsMap = new HashMap<>();
        for (Appointment app : appointments) {
            ClientProfile client = app.getClient();
            clientsMap.putIfAbsent(client.getId(), ClientDTO.builder()
                    .clientId(client.getId())
                    .clientName(client.getFullName())
                    .clientEmail(client.getUser().getEmail())
                    .clientPhone(client.getPhone())
                    .clientProfilePicture(client.getProfilePictureUrl())
                    .build());
        }

        return new ArrayList<>(clientsMap.values());
    }




}
