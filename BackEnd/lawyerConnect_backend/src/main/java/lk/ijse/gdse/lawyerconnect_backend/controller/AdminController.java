package lk.ijse.gdse.lawyerconnect_backend.controller;

import lombok.RequiredArgsConstructor;
import lk.ijse.gdse.lawyerconnect_backend.dto.ApiResponse;
import lk.ijse.gdse.lawyerconnect_backend.entity.UserStatus;
import lk.ijse.gdse.lawyerconnect_backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getDashboardStats() {
        return ResponseEntity.ok(new ApiResponse(200, "OK", adminService.getAdminDashboardStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers() {
        return ResponseEntity.ok(new ApiResponse(200, "OK", adminService.getAllUsers()));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam UserStatus status) {
        return ResponseEntity.ok(new ApiResponse(200, "User status updated", adminService.updateUserStatus(userId, status)));
    }

    @GetMapping("/lawyers")
    public ResponseEntity<ApiResponse> getAllLawyers() {
        return ResponseEntity.ok(new ApiResponse(200, "OK", adminService.getAllLawyers()));
    }

    @PatchMapping("/lawyers/{lawyerId}/verify")
    public ResponseEntity<ApiResponse> updateLawyerVerification(
            @PathVariable Long lawyerId,
            @RequestParam String status) {
        return ResponseEntity.ok(new ApiResponse(200, "Lawyer verification updated", adminService.updateLawyerVerification(lawyerId, status)));
    }

    @PostMapping("/specializations")
    public ResponseEntity<ApiResponse> addSpecialization(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        return ResponseEntity.ok(new ApiResponse(201, "Specialization created", adminService.addSpecialization(name)));
    }

    @DeleteMapping("/specializations/{id}")
    public ResponseEntity<ApiResponse> deleteSpecialization(@PathVariable Long id) {
        adminService.deleteSpecialization(id);
        return ResponseEntity.ok(new ApiResponse(200, "Specialization deleted", null));
    }
}
