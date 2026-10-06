package lk.ijse.gdse.lawyerconnect_backend.service.impl;

import lombok.RequiredArgsConstructor;
import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.Role;
import lk.ijse.gdse.lawyerconnect_backend.entity.Specialization;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.entity.UserStatus;
import lk.ijse.gdse.lawyerconnect_backend.repository.AppointmentRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.SpecializationRepository;
import lk.ijse.gdse.lawyerconnect_backend.repository.UserRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.AdminService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final SpecializationRepository specializationRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.count();
        long totalLawyers = lawyerProfileRepository.count();
        long totalAppointments = appointmentRepository.count();
        long activeClients = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CLIENT)
                .count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalLawyers", totalLawyers);
        stats.put("totalClients", activeClients);
        stats.put("totalAppointments", totalAppointments);
        stats.put("totalSpecializations", specializationRepository.count());
        return stats;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public User updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Override
    public List<LawyerProfile> getAllLawyers() {
        return lawyerProfileRepository.findAll();
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = {"lawyers", "lawyers_by_category"}, allEntries = true)
    public LawyerProfile updateLawyerVerification(Long lawyerId, String status) {
        LawyerProfile profile = lawyerProfileRepository.findById(lawyerId)
                .orElseThrow(() -> new RuntimeException("Lawyer profile not found with id: " + lawyerId));

        profile.setVerificationStatus(status);
        if (profile.getUser() != null) {
            if ("APPROVED".equalsIgnoreCase(status)) {
                profile.getUser().setStatus(UserStatus.ACTIVE);
                userRepository.save(profile.getUser());
            } else if ("REJECTED".equalsIgnoreCase(status)) {
                profile.getUser().setStatus(UserStatus.SUSPENDED);
                userRepository.save(profile.getUser());
            }
        }

        return lawyerProfileRepository.save(profile);
    }

    @Override
    @Transactional
    public Specialization addSpecialization(String name) {
        Specialization spec = new Specialization();
        spec.setSpecialization(name);
        return specializationRepository.save(spec);
    }

    @Override
    @Transactional
    public void deleteSpecialization(Long id) {
        specializationRepository.deleteById(id);
    }

    @Override
    @Transactional
    public User createAdminUser(lk.ijse.gdse.lawyerconnect_backend.dto.RegisterDTO registerDTO) {
        if (userRepository.findByUsername(registerDTO.getUsername()).isPresent()) {
            throw new RuntimeException("Username '" + registerDTO.getUsername() + "' is already taken.");
        }
        User admin = User.builder()
                .name(registerDTO.getName())
                .username(registerDTO.getUsername())
                .email(registerDTO.getEmail())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .createdAt(java.time.LocalDateTime.now())
                .build();
        return userRepository.save(admin);
    }

    @Override
    @Transactional
    public void changeAdminPassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
