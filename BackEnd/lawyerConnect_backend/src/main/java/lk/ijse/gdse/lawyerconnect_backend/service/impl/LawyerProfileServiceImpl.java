package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lk.ijse.gdse.lawyerconnect_backend.dto.AvailabilityDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.LawyerProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerAvailability;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.Specialization;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerAvailabilityRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.SpecializationRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerProfileService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LawyerProfileServiceImpl implements LawyerProfileService {

    private final LawyerProfileRepository lawyerProfileRepository;
    private final LawyerAvailabilityRepository lawyerAvailabilityRepository;
    private final SpecializationRepository specializationRepository;
    private final ModelMapper modelMapper;
    private final String UPLOAD_DIR = "uploads/profile-images";


    @Override
    public void saveProfile(User user, LawyerProfileDTO dto, MultipartFile profilePicture) {

        lawyerProfileRepository.findByUser(user)
                .ifPresent(profile -> {
                    throw new RuntimeException("Profile already exists for this user");
                });

//        LawyerProfile profile = modelMapper.map(dto , LawyerProfile.class);
        LawyerProfile profile = new LawyerProfile();

        profile.setFullName(dto.getFullName());
        profile.setEmail(dto.getEmail());
        profile.setWorkingAddress(dto.getWorkingAddress());
        profile.setPhone(dto.getPhone());
        profile.setSpecialties(dto.getSpecialties());
        profile.setYearsOfExperience(dto.getYearsOfExperience());
        profile.setLicenceNumber(dto.getLicenceNumber());
        profile.setBio(dto.getBio());
        profile.setProfilePictureUrl(dto.getProfilePictureUrl());
        profile.setUser(user);

        if (dto.getSpecializationIds() != null && !dto.getSpecializationIds().isEmpty()) {
            List<Specialization> specs = specializationRepository.findAllById(dto.getSpecializationIds());
            profile.setSpecializations(specs);

//            // optional: also store names as a simple string
//            String names = specs.stream().map(Specialization::getSpecialization).toList().toString();
//            profile.setSpecialties(names);
        }

        if (profilePicture != null && !profilePicture.isEmpty()) {
            String fileUrl = saveFile(profilePicture);
            profile.setProfilePictureUrl(fileUrl);
        }

        lawyerProfileRepository.save(profile);
    }



    @Override
    public void updateProfile(User user , LawyerProfileDTO dto, MultipartFile profilePicture) {
        LawyerProfile profile = lawyerProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

//        modelMapper.map(dto , profile);

        profile.setFullName(dto.getFullName());
        profile.setEmail(dto.getEmail());
        profile.setWorkingAddress(dto.getWorkingAddress());
        profile.setPhone(dto.getPhone());
        profile.setSpecialties(dto.getSpecialties());
        profile.setYearsOfExperience(dto.getYearsOfExperience());
        profile.setLicenceNumber(dto.getLicenceNumber());
        profile.setBio(dto.getBio());
        profile.setProfilePictureUrl(dto.getProfilePictureUrl());


        if (dto.getSpecializationIds() != null && !dto.getSpecializationIds().isEmpty()) {
            List<Specialization> specs = specializationRepository.findAllById(dto.getSpecializationIds());
            profile.setSpecializations(specs);
        }

//        profile.setUser(user);

        if (profilePicture != null && !profilePicture.isEmpty()) {
            String fileUrl = saveFile(profilePicture);
            profile.setProfilePictureUrl(fileUrl);
        }

        lawyerProfileRepository.save(profile);

    }



    @Override
    public LawyerProfileDTO getProfile(User user) {

        LawyerProfile lawyerProfile = lawyerProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        return modelMapper.map(lawyerProfile , LawyerProfileDTO.class);

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
            throw new RuntimeException("Failed to store file", e);
        }
    }



    @Override
    public void saveAvailability(User user, AvailabilityDTO availabilityDTO) {

        LawyerProfile profile = lawyerProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        LawyerAvailability availability = LawyerAvailability.builder()
                .date(availabilityDTO.getDate())
                .startTime(availabilityDTO.getStartTime())
                .endTime(availabilityDTO.getEndTime())
                .lawyerProfile(profile)
                .build();

        lawyerAvailabilityRepository.save(availability);

    }


    @Override
    public List<AvailabilityDTO> getAvailability(User user) {

        LawyerProfile profile = lawyerProfileRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        return lawyerAvailabilityRepository.findByLawyerProfile(profile)
                .stream()
                .map(a -> modelMapper.map(a, AvailabilityDTO.class))
                .toList();


    }



}
