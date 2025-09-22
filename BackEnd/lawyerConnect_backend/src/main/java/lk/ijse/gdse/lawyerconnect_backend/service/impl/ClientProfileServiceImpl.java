package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lk.ijse.gdse.lawyerconnect_backend.dto.ClientProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.LawyerProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.ClientProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.exception.AllReadyFoundException;
import lk.ijse.gdse.lawyerconnect_backend.exception.FileStorageException;
import lk.ijse.gdse.lawyerconnect_backend.exception.ResourceNotFoundException;
import lk.ijse.gdse.lawyerconnect_backend.repository.ClientProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.ClientProfileService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ClientProfileServiceImpl implements ClientProfileService {

    private final ClientProfileRepository clientProfileRepository;
    private final ModelMapper modelMapper;
    private final String UPLOAD_DIR = "uploads/profile-images";

    @Override
    public void saveProfile(User user, ClientProfileDTO clientProfileDTO, MultipartFile profilePicture) {

        clientProfileRepository.findByUser(user)
                .ifPresent(profile -> {
                    throw new AllReadyFoundException("Profile already exists for this user");
                });

        ClientProfile profile = modelMapper.map(clientProfileDTO , ClientProfile.class);
        profile.setUser(user);
        if (profilePicture != null && !profilePicture.isEmpty()) {
            String fileUrl = saveFile(profilePicture);
            profile.setProfilePictureUrl(fileUrl);
        }
        clientProfileRepository.save(profile);
    }

    @Override
    public void updateProfile(User user, ClientProfileDTO clientProfileDTO, MultipartFile profilePicture) {

        ClientProfile profile = clientProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        modelMapper.map(clientProfileDTO , profile);
        profile.setUser(user);
        if (profilePicture != null && !profilePicture.isEmpty()) {
            String fileUrl = saveFile(profilePicture);
            profile.setProfilePictureUrl(fileUrl);
        }
        clientProfileRepository.save(profile);

    }



    @Override
    public ClientProfileDTO getProfile(User user) {

        ClientProfile profile = clientProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        return modelMapper.map(profile , ClientProfileDTO.class);


    }

    private String saveFile(MultipartFile file) {
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = "";

            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex >= 0) {
                fileExtension = originalFilename.substring(dotIndex);
            }

            String newFileName = UUID.randomUUID().toString() + fileExtension;
            Path uploadPath = Paths.get(UPLOAD_DIR);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(newFileName);
            Files.copy(file.getInputStream(), filePath);

            return "/uploads/profile-images/" + newFileName;
        } catch (IOException e) {
//            throw new RuntimeException("Failed to store file", e);
            throw new FileStorageException("Failed to store file");
        }
    }




}
