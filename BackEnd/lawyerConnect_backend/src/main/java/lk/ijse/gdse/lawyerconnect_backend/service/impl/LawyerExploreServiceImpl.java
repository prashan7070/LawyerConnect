package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lk.ijse.gdse.lawyerconnect_backend.dto.LawyerProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerExploreService;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerProfileService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LawyerExploreServiceImpl implements LawyerExploreService {

    private final LawyerProfileRepository lawyerProfileRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<LawyerProfileDTO> getAllLawyers() {

        List<LawyerProfile> profiles = lawyerProfileRepository.findAll();
        if (profiles.isEmpty()){
            throw new RuntimeException("No profiles Found");
        }
        return modelMapper.map(profiles , new TypeToken<List<LawyerProfileDTO>>(){}.getType());

    }


}
