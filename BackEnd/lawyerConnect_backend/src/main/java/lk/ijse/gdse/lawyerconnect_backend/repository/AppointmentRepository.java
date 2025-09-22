package lk.ijse.gdse.lawyerconnect_backend.repository;

import lk.ijse.gdse.lawyerconnect_backend.entity.Appointment;
import lk.ijse.gdse.lawyerconnect_backend.entity.AppointmentStatus;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository  extends JpaRepository<Appointment , Long> {

    List<Appointment> findByLawyerAndScheduledAtBetween(LawyerProfile lawyer, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByLawyerAndScheduledAtBetweenOrderByScheduledAtAsc(LawyerProfile lawyer, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByClientId(Long clientId);

    List<Appointment> findByLawyerId(Long id);


    @Query("SELECT COUNT(a) FROM Appointment a " +
            "WHERE a.lawyer.id = :lawyerId AND a.status IN :statuses AND a.scheduledAt >= :now")
    Long countUpcomingForLawyer(@Param("lawyerId") Long lawyerId,
                                @Param("statuses") java.util.List<AppointmentStatus> statuses,
                                @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(DISTINCT a.client.id) FROM Appointment a WHERE a.lawyer.id = :lawyerId")
    Long countDistinctClientsByLawyerId(@Param("lawyerId") Long lawyerId);


}
