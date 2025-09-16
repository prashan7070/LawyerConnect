package lk.ijse.gdse.lawyerconnect_backend.controller;

import lk.ijse.gdse.lawyerconnect_backend.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lk.ijse.gdse.lawyerconnect_backend.dto.AuthDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.AuthResponseDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.RegisterDTO;
import lk.ijse.gdse.lawyerconnect_backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(
            @RequestBody RegisterDTO registerDTO) {
        System.out.println("register user called");
        System.out.println(registerDTO.toString());
        return ResponseEntity.ok(new ApiResponse(
                200,
                "OK",
                authService.register(registerDTO)));
    }


    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(
            @RequestBody AuthDTO authDTO) {

        System.out.println("login user called");

        return ResponseEntity.ok(new ApiResponse(
                200,
                "OK",
                authService.authenticate(authDTO)));
    }

}
