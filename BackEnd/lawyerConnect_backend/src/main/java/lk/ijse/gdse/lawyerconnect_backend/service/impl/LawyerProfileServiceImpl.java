package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lk.ijse.gdse.lawyerconnect_backend.dto.AvailabilityDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.LawyerProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.SpecializationDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerAvailability;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.Specialization;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.exception.AllReadyFoundException;
import lk.ijse.gdse.lawyerconnect_backend.exception.FileStorageException;
import lk.ijse.gdse.lawyerconnect_backend.exception.ResourceNotFoundException;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerAvailabilityRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.SpecializationRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerProfileService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
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
    @Transactional
    public void saveProfile(User user, LawyerProfileDTO dto, MultipartFile profilePicture) {

        lawyerProfileRepository.findByUser(user)
                .ifPresent(profile -> {
                    throw new AllReadyFoundException("Profile already exists for this user");
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
        profile.setOnlineFee(dto.getOnlineFee());
        profile.setInPersonFee(dto.getInPersonFee());
        profile.setUser(user);

        if (dto.getSpecializationIds() != null && !dto.getSpecializationIds().isEmpty()) {
            List<Specialization> specs = specializationRepository.findAllById(dto.getSpecializationIds());
            profile.setSpecializations(specs);

        }


        if (profilePicture != null && !profilePicture.isEmpty()) {
            String fileUrl = saveFile(profilePicture);
            profile.setProfilePictureUrl(fileUrl);
        }

        lawyerProfileRepository.save(profile);
        saveAvailability(user , dto.getAvailabilitySlots());

    }



    @Override
    @Transactional
    public void updateProfile(User user , LawyerProfileDTO dto, MultipartFile profilePicture) {
        LawyerProfile profile = lawyerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

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
        profile.setOnlineFee(dto.getOnlineFee());
        profile.setInPersonFee(dto.getInPersonFee());

        if (dto.getSpecializationIds() != null && !dto.getSpecializationIds().isEmpty()) {
            List<Specialization> specs = specializationRepository.findAllById(dto.getSpecializationIds());
            profile.setSpecializations(specs);
        }

        saveAvailability(user , dto.getAvailabilitySlots());

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
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));


        LawyerProfileDTO lawyerProfileDTO =  modelMapper.map(lawyerProfile , LawyerProfileDTO.class);

        List<SpecializationDTO> specDtos = lawyerProfile.getSpecializations()
                .stream()
                .map(spec -> modelMapper.map(spec, SpecializationDTO.class))
                .toList();
        lawyerProfileDTO.setSpecializations(specDtos);

        List<AvailabilityDTO> availabilityDtos = lawyerAvailabilityRepository.findByLawyerProfile(lawyerProfile)
                .stream()
                .map(a -> modelMapper.map(a, AvailabilityDTO.class))
                .toList();
        lawyerProfileDTO.setAvailabilitySlots(availabilityDtos);


        return lawyerProfileDTO;

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



    @Transactional
    public void saveAvailability(User user, List<AvailabilityDTO> availabilityDTO) {

        LawyerProfile profile = lawyerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        if (availabilityDTO != null && !availabilityDTO.isEmpty()) {

            lawyerAvailabilityRepository.deleteByLawyerProfile(profile);

            List<LawyerAvailability> availabilities = availabilityDTO.stream()
                    .map(dto -> LawyerAvailability.builder()
                            .dayOfWeek((dto.getDayOfWeek()))
                            .startTime(dto.getStartTime())
                            .endTime(dto.getEndTime())
                            .lawyerProfile(profile)
                            .build()
                    )
                    .toList();

            lawyerAvailabilityRepository.saveAll(availabilities);
        }


    }


    @Override
    public List<AvailabilityDTO> getAvailability(User user) {

        LawyerProfile profile = lawyerProfileRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));

        return lawyerAvailabilityRepository.findByLawyerProfile(profile)
                .stream()
                .map(a -> modelMapper.map(a, AvailabilityDTO.class))
                .toList();


    }

    @Override
    public List<SpecializationDTO> getSpecializations() {

        List<Specialization> specializations = specializationRepository.findAll();
        if (specializations.isEmpty()){
            throw new ResourceNotFoundException("can not find any specializations");
        }
        return modelMapper.map(specializations , new TypeToken<List<SpecializationDTO>>(){}.getType());
    }


}
