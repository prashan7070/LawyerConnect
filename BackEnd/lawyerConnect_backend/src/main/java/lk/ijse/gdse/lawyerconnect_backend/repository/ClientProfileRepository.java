package lk.ijse.gdse.lawyerconnect_backend.repository;

import lk.ijse.gdse.lawyerconnect_backend.entity.ClientProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Repository
public interface ClientProfileRepository extends JpaRepository<ClientProfile , Long> {

    Optional<ClientProfile> findByUser(User user);


}
