package lk.ijse.gdse.lawyerconnect_backend.repository;

import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface LawyerProfileRepository extends JpaRepository<LawyerProfile, Long> {

    Optional<LawyerProfile> findByUser(User user);

    @Query("SELECT l FROM LawyerProfile l WHERE LOWER(l.specialties) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<LawyerProfile> findBySpecializationsSpecializationContainingIgnoreCase(@Param("keyword") String keyword);
}

