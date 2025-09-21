package lk.ijse.gdse.lawyerconnect_backend.repository;

import lk.ijse.gdse.lawyerconnect_backend.entity.Appointment;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository  extends JpaRepository<Appointment , Long> {

    List<Appointment> findByLawyerAndScheduledAtBetween(LawyerProfile lawyer, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByLawyerAndScheduledAtBetweenOrderByScheduledAtAsc(LawyerProfile lawyer, LocalDateTime start, LocalDateTime end);

}
