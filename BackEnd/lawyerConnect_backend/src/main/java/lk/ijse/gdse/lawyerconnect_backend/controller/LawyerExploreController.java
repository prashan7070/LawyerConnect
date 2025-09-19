package lk.ijse.gdse.lawyerconnect_backend.controller;

import lk.ijse.gdse.lawyerconnect_backend.dto.ApiResponse;
import lk.ijse.gdse.lawyerconnect_backend.dto.LawyerProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerExploreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/client/explore")
@RequiredArgsConstructor
@CrossOrigin("**")
public class LawyerExploreController {

        private final LawyerExploreService lawyerExploreService;

        @GetMapping("getAllLawyers")
        public ResponseEntity<ApiResponse> getAllLawyers(){

            List<LawyerProfileDTO> lawyerProfiles = lawyerExploreService.getAllLawyers();
            return new ResponseEntity(new ApiResponse(200 , "success" , lawyerProfiles), HttpStatus.OK);

        }



}
