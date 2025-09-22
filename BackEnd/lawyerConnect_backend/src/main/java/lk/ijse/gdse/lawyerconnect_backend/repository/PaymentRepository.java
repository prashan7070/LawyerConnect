package lk.ijse.gdse.lawyerconnect_backend.repository;

import lk.ijse.gdse.lawyerconnect_backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface PaymentRepository extends JpaRepository<Payment , Long> {

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
            "WHERE p.appointment.lawyer.id = :lawyerId " +
            "AND p.paidAt BETWEEN :start AND :end")
    BigDecimal sumPaidAmountForLawyerBetween(@Param("lawyerId") Long lawyerId,
                                             @Param("start") LocalDateTime start,
                                             @Param("end") LocalDateTime end);


}
