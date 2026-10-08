package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.dto.AuthDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.AuthResponseDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.RegisterDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.Role;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.repository.ClientProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.UserRepository;
import lk.ijse.gdse.lawyerconnect_backend.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private LawyerProfileRepository lawyerProfileRepository;

    @Mock
    private ClientProfileRepository clientProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .userId(1L)
                .username("testclient")
                .name("Test Client")
                .email("test@lawyerconnect.lk")
                .password("encoded_pass")
                .role(Role.CLIENT)
                .build();
    }

    @Test
    @DisplayName("Should successfully authenticate user with valid credentials")
    void testLoginSuccess() {
        AuthDTO authDTO = new AuthDTO();
        authDTO.setUsername("testclient");
        authDTO.setPassword("raw_pass");

        when(userRepository.findByUsername("testclient")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("raw_pass", "encoded_pass")).thenReturn(true);
        when(jwtUtil.generateToken("testclient", Role.CLIENT)).thenReturn("mock_jwt_token");
        when(jwtUtil.generateRefreshToken("testclient")).thenReturn("mock_refresh_token");

        AuthResponseDTO response = authService.authenticate(authDTO);

        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getAccessToken());
        assertEquals("testclient", response.getUsername());
        assertEquals("CLIENT", response.getRole());
        verify(userRepository, times(1)).findByUsername("testclient");
    }

    @Test
    @DisplayName("Should block ADMIN registration from public endpoint")
    void testPublicAdminRegistrationBlocked() {
        RegisterDTO registerDTO = new RegisterDTO();
        registerDTO.setUsername("hackeradmin");
        registerDTO.setRole("ADMIN");

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(registerDTO);
        });

        assertTrue(exception.getMessage().contains("strictly prohibited"));
    }
}
