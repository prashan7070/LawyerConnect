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

    


}
