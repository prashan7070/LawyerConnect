package lk.ijse.gdse.lawyerconnect_backend.repository;

import lk.ijse.gdse.lawyerconnect_backend.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, Long> {




}
