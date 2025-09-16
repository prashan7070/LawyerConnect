package lk.ijse.gdse.lawyerconnect_backend.repository;

import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LawyerProfileRepository extends JpaRepository<LawyerProfile, Long> {

    Optional<LawyerProfile> findByUser(User user);


}
