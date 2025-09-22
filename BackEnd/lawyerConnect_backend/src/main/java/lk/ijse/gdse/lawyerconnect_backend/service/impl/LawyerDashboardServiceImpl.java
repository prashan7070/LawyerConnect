package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lk.ijse.gdse.lawyerconnect_backend.dto.DashboardOverviewDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.AppointmentStatus;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.exception.ResourceNotFoundException;
import lk.ijse.gdse.lawyerconnect_backend.repository.AppointmentRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.PaymentRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;


@Service
@RequiredArgsConstructor
public class LawyerDashboardServiceImpl implements LawyerDashboardService {

    private final AppointmentRepository appointmentRepository;
    private final PaymentRepository paymentRepository;
    private final LawyerProfileRepository lawyerProfileRepository;

    @Override
    public DashboardOverviewDTO getOverviewForLawyer(User user) {

        LawyerProfile profile = lawyerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer profile not found"));

        Long lawyerId = profile.getId();

        List<AppointmentStatus> upcomingStatuses = List.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);
        LocalDateTime now = LocalDateTime.now();

        Long upcomingCount = appointmentRepository.countUpcomingForLawyer(lawyerId, upcomingStatuses, now);

        Long totalClients = appointmentRepository.countDistinctClientsByLawyerId(lawyerId);
        if (totalClients == null) totalClients = 0L;

        LocalDate today = LocalDate.now();
        LocalDateTime startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);

        BigDecimal monthlyEarnings = paymentRepository.sumPaidAmountForLawyerBetween(lawyerId, startOfMonth, endOfMonth);
        if (monthlyEarnings == null) monthlyEarnings = BigDecimal.ZERO;

        return DashboardOverviewDTO.builder()
                .upcomingCount(upcomingCount == null ? 0L : upcomingCount)
                .totalClients(totalClients)
                .monthlyEarnings(monthlyEarnings)
                .avgRating(null)
                .build();
    }


}
