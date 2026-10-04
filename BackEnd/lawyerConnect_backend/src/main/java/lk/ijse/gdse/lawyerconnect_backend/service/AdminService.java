package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.entity.Specialization;
import lk.ijse.gdse.lawyerconnect_backend.entity.User;
import lk.ijse.gdse.lawyerconnect_backend.entity.UserStatus;

import java.util.List;
import java.util.Map;

public interface AdminService {
    Map<String, Object> getAdminDashboardStats();
    List<User> getAllUsers();
    User updateUserStatus(Long userId, UserStatus status);
    List<LawyerProfile> getAllLawyers();
    Specialization addSpecialization(String name);
    void deleteSpecialization(Long id);
}
