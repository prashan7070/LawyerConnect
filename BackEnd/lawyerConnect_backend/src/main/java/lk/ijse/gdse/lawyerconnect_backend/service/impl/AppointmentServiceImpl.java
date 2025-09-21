package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lk.ijse.gdse.lawyerconnect_backend.dto.BookAppointmentRequestDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.BookAppointmentResponseDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.*;
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
import java.util.List;
import java.util.UUID;

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
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        LawyerProfile lawyer = lawyerProfileRepository.findById(request.getLawyerId())
                .orElseThrow(() -> new RuntimeException("Lawyer not found"));

        ClientProfile client = clientProfileRepository.findById(profile.getId())
                .orElseThrow(() -> new RuntimeException("Client not found"));

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
            throw new RuntimeException("Selected time slot is already booked.");
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
                .status(AppointmentStatus.CONFIRMED)
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


}
