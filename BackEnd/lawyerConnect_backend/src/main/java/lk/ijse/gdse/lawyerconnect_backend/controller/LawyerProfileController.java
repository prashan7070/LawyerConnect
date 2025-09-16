package lk.ijse.gdse.lawyerconnect_backend.controller;


import lk.ijse.gdse.lawyerconnect_backend.dto.ApiResponse;
import lk.ijse.gdse.lawyerconnect_backend.dto.LawyerProfileDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.repository.UserRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.LawyerProfileService;
import lk.ijse.gdse.lawyerconnect_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.Authenticator;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/lawyer/profile")
@CrossOrigin("**")
@RequiredArgsConstructor

public class LawyerProfileController {

    private final LawyerProfileService lawyerProfileService;
    private final UserService userService;


    @PostMapping("/saveProfile")
    public ResponseEntity<ApiResponse> saveLawyerProfile(@ModelAttribute LawyerProfileDTO lawyerProfileDTO , @RequestParam(value = "profilePicture" , required = false) MultipartFile profilePicture){

        System.out.println("Save profile controller called");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userService.getUserByUsername(username);
        lawyerProfileService.saveProfile(user , lawyerProfileDTO , profilePicture);

        return new ResponseEntity(new ApiResponse(200,"Profile Created Successfully",null), HttpStatus.CREATED);

    }


    @PutMapping("/updateProfile")
    public ResponseEntity<ApiResponse> updateLawyerProfile(@ModelAttribute LawyerProfileDTO lawyerProfileDTO , @RequestParam(value = "profilePicture" , required = false) MultipartFile profilePicture){

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);

        lawyerProfileService.updateProfile(user , lawyerProfileDTO , profilePicture);
        return new ResponseEntity(new ApiResponse(200,"Profile Created Successfully",null), HttpStatus.OK);


    }

    @GetMapping("/getProfile")
    public ResponseEntity<ApiResponse> getLawyerProfile(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        LawyerProfileDTO lawyerProfileDTO = lawyerProfileService.getProfile(user);
        return new ResponseEntity(new ApiResponse(200,"Profile fetched Successfully",lawyerProfileDTO), HttpStatus.OK);
    }




}
