package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lk.ijse.gdse.lawyerconnect_backend.dto.LawyerProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.exception.ResourceNotFoundException;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerExploreService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LawyerExploreServiceImpl implements LawyerExploreService {

    private final LawyerProfileRepository lawyerProfileRepository;
    private final ModelMapper modelMapper;

    @Override
    @Cacheable(value = "lawyers")
    public List<LawyerProfileDTO> getAllLawyers() {
        List<LawyerProfile> profiles = lawyerProfileRepository.findAll().stream()
                .filter(p -> p.getVerificationStatus() == null || "APPROVED".equalsIgnoreCase(p.getVerificationStatus()))
                .toList();
        return modelMapper.map(profiles , new TypeToken<List<LawyerProfileDTO>>(){}.getType());
    }

    @Override
    @Cacheable(value = "lawyers_by_category", key = "#keyword")
    public List<LawyerProfileDTO> searchLawyersByCategory(String keyword) {
        List<LawyerProfile> profiles = lawyerProfileRepository.findBySpecializationsSpecializationContainingIgnoreCase(keyword).stream()
                .filter(p -> p.getVerificationStatus() == null || "APPROVED".equalsIgnoreCase(p.getVerificationStatus()))
                .toList();
        return modelMapper.map(profiles , new TypeToken<List<LawyerProfileDTO>>(){}.getType());
    }
}
