package lk.ijse.gdse.lawyerconnect_backend.controller;


import lk.ijse.gdse.lawyerconnect_backend.dto.*;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.service.ClientProfileService;
import lk.ijse.gdse.lawyerconnect_backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/client/profile")
@CrossOrigin("**")
@RequiredArgsConstructor
public class ClientProfileController {

    private final UserService userService;
    private final ClientProfileService clientProfileService;


    @PostMapping("/saveProfile")
    public ResponseEntity<ApiResponse> saveClientProfile(@RequestPart("clientProfile") ClientProfileDTO clientProfileDTO , @RequestPart(value = "profilePicture" , required = false) MultipartFile profilePicture) {

        System.out.println("Save profile controller called");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        User user = userService.getUserByUsername(username);

        clientProfileService.saveProfile(user , clientProfileDTO , profilePicture);

        return new ResponseEntity(new ApiResponse(200,"Profile Created Successfully",null), HttpStatus.CREATED);

    }





    @PutMapping("/updateProfile")
    public ResponseEntity<ApiResponse> updateClientProfile(@RequestPart("clientProfile") ClientProfileDTO clientProfileDTO , @RequestPart(value = "profilePicture" , required = false) MultipartFile profilePicture){


        System.out.println("update profile called");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);

        clientProfileService.updateProfile(user , clientProfileDTO , profilePicture);
        return new ResponseEntity(new ApiResponse(200,"Profile Created Successfully",null), HttpStatus.OK);

    }



    @GetMapping("/getProfile")
    public ResponseEntity<ApiResponse> getClientProfile(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.getUserByUsername(username);
        ClientProfileDTO clientProfileDTO = clientProfileService.getProfile(user);
        return new ResponseEntity(new ApiResponse(200,"Profile fetched Successfully",clientProfileDTO), HttpStatus.OK);
    }






}
