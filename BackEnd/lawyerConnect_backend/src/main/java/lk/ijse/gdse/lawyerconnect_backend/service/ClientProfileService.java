package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.dto.ClientProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import org.springframework.web.multipart.MultipartFile;

public interface ClientProfileService {
    void saveProfile(User user, ClientProfileDTO clientProfileDTO, MultipartFile profilePicture);

    void updateProfile(User user, ClientProfileDTO clientProfileDTO, MultipartFile profilePicture);

    ClientProfileDTO getProfile(User user);
}
