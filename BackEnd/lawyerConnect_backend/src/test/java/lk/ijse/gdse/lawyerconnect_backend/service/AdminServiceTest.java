package lk.ijse.gdse.lawyerconnect_backend.service;

import lk.ijse.gdse.lawyerconnect_backend.entity.LawyerProfile;
import lk.ijse.gdse.lawyerconnect_backend.repository.LawyerProfileRepository;
import lk.ijse.gdse.lawyerconnect_backend.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private LawyerProfileRepository lawyerProfileRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    private LawyerProfile pendingProfile;

    @BeforeEach
    void setUp() {
        pendingProfile = new LawyerProfile();
        pendingProfile.setId(10L);
        pendingProfile.setVerificationStatus("PENDING");
    }

    @Test
    @DisplayName("Should successfully update lawyer verification status to APPROVED")
    void testVerifyLawyerStatus() {
        when(lawyerProfileRepository.findById(10L)).thenReturn(Optional.of(pendingProfile));
        when(lawyerProfileRepository.save(any(LawyerProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var updated = adminService.updateLawyerVerification(10L, "APPROVED");

        assertNotNull(updated);
        assertEquals("APPROVED", updated.getVerificationStatus());
        verify(lawyerProfileRepository, times(1)).save(pendingProfile);
    }
}
