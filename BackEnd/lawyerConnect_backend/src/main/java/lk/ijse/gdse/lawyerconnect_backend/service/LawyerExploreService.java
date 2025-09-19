package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.dto.LawyerProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;

import java.util.List;

public interface LawyerExploreService {

    List<LawyerProfileDTO> getAllLawyers();

}
