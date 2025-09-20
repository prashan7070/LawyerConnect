package lk.ijse.gdse.lawyerconnect_backend.repository;

import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerAvailability;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LawyerAvailabilityRepository extends JpaRepository<LawyerAvailability , Long> {

    List<LawyerAvailability> findByLawyerProfile(LawyerProfile profile);
    void deleteByLawyerProfile(LawyerProfile profile);


}
