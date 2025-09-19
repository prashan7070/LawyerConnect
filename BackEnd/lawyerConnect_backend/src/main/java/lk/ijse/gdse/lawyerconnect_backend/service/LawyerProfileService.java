package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.dto.LawyerProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LawyerProfileService {


        void saveProfile(User user, LawyerProfileDTO dto, MultipartFile profilePicture);
        void updateProfile(User user , LawyerProfileDTO dto, MultipartFile profilePicture);
        LawyerProfileDTO getProfile(User user);

}
