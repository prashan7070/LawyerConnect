package lk.ijse.gdse.lawyerconnect_backend.service;

import lombok.RequiredArgsConstructor;
import lk.ijse.gdse.lawyerconnect_backend.dto.AuthDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.AuthResponseDTO;
import lk.ijse.gdse.lawyerconnect_backend.dto.RegisterDTO;
import lk.ijse.gdse.lawyerconnect_backend.entity.ClientProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.Role;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.entity.UserStatus;
import lk.ijse.gdse.lawyerconnect_backend.repository.ClientProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.UserRepository;
import lk.ijse.gdse.lawyerconnect_backend.util.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final ClientProfileRepository clientProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponseDTO authenticate(AuthDTO authDTO) {
        User user = userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(authDTO.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new RuntimeException("Account has been suspended. Please contact administrator.");
        }

        String accessToken = jwtUtil.generateToken(user.getUsername(), user.getRole());
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        return AuthResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .role(user.getRole().name())
                .username(user.getUsername())
                .userId(user.getUserId())
                .name(user.getName())
                .build();
    }

    @Transactional
    public String register(RegisterDTO registerDTO) {
        if (userRepository.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        Role role;
        try {
            role = Role.valueOf(registerDTO.getRole().toUpperCase());
        } catch (Exception e) {
            role = Role.CLIENT;
        }

        User user = User.builder()
                .name(registerDTO.getName())
                .username(registerDTO.getUsername())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .email(registerDTO.getEmail())
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        if (role == Role.LAWYER) {
            LawyerProfile lawyerProfile = new LawyerProfile();
            lawyerProfile.setFullName(savedUser.getName());
            lawyerProfile.setEmail(savedUser.getEmail());
            lawyerProfile.setUser(savedUser);
            lawyerProfileRepository.save(lawyerProfile);
        } else if (role == Role.CLIENT) {
            ClientProfile clientProfile = new ClientProfile();
            clientProfile.setName(savedUser.getName());
            clientProfile.setEmail(savedUser.getEmail());
            clientProfile.setUser(savedUser);
            clientProfileRepository.save(clientProfile);
        }

        return "User registered successfully as " + role.name();
    }
}
